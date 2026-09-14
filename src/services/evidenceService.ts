import { Blob as ExpoBlob } from 'expo-blob';
import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Evidence } from '../types';

const EVIDENCE_COLLECTION = 'evidence';
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.7;

export async function getEvidenceForFinding(ownerId: string, findingId: string): Promise<Evidence[]> {
  const q = query(
    collection(db, EVIDENCE_COLLECTION),
    where('ownerId', '==', ownerId),
    where('findingId', '==', findingId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Evidence);
  return items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function createTextEvidence(
  ownerId: string,
  assessmentId: string,
  findingId: string,
  input: { caption: string; textContent: string }
): Promise<string> {
  const evidenceRef = doc(collection(db, EVIDENCE_COLLECTION));
  await setDoc(evidenceRef, {
    type: 'TEXT',
    caption: input.caption,
    textContent: input.textContent,
    ownerId,
    assessmentId,
    findingId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return evidenceRef.id;
}

// Resizes and compresses the screenshot before upload to keep Firebase
// Storage usage (and the user's mobile data) reasonable, then uploads it
// to a per-user, per-finding path that only the owner can read or write
// (see storage.rules) - never a public download URL.
export async function createScreenshotEvidence(
  ownerId: string,
  assessmentId: string,
  findingId: string,
  input: { caption: string; localUri: string }
): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    input.localUri,
    [{ resize: { width: MAX_IMAGE_DIMENSION } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Two things had to both be right here, found by testing on-device:
  // 1. Reading the local file: fetch(uri).blob() is unreliable for local
  //    file:// URIs on React Native (silently producible empty/corrupt
  //    blobs) - expo-file-system's File.arrayBuffer() reads real bytes
  //    natively instead.
  // 2. Wrapping those bytes for Firebase: React Native's built-in global
  //    Blob cannot be constructed from raw ArrayBuffer/typed-array data
  //    ("Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not
  //    supported") - and Firebase Storage's uploadBytes/uploadString both
  //    hit that internally when given raw bytes. expo-blob's Blob is a
  //    real native-backed Blob that explicitly accepts ArrayBuffer parts.
  const bytes = await new File(manipulated.uri).arrayBuffer();
  const blob = new ExpoBlob([bytes], { type: 'image/jpeg' });

  const evidenceRef = doc(collection(db, EVIDENCE_COLLECTION));
  const storagePath = `users/${ownerId}/assessments/${assessmentId}/findings/${findingId}/evidence/${evidenceRef.id}.jpg`;
  const storageRef = ref(storage, storagePath);
  // expo-blob's Blob is functionally a real Blob at runtime (that's the
  // whole point of using it here) but its generic typing differs slightly
  // from the DOM Blob type Firebase's SDK expects (ArrayBufferLike vs
  // ArrayBuffer) - safe to assert past that mismatch.
  await uploadBytes(storageRef, blob as unknown as Blob, { contentType: 'image/jpeg' });

  await setDoc(evidenceRef, {
    type: 'SCREENSHOT',
    caption: input.caption,
    storagePath,
    fileName: `${evidenceRef.id}.jpg`,
    fileSize: blob.size,
    ownerId,
    assessmentId,
    findingId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return evidenceRef.id;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Pure-JS base64 encoder so this works the same on Android (Hermes has no
// global btoa) and web, without adding a polyfill dependency.
function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    result += BASE64_CHARS[b1 >> 2];
    result += BASE64_CHARS[((b1 & 3) << 4) | (b2 >> 4)];
    result += b2 !== undefined ? BASE64_CHARS[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += b3 !== undefined ? BASE64_CHARS[b3 & 63] : '=';
  }
  return result;
}

// Reads the image via the Storage SDK (which enforces storage.rules and
// requires the caller to be authenticated as the owner) and returns a
// base64 data URI for display - deliberately never calls
// getDownloadURL(), which would hand out a token usable without further
// authorization checks.
export async function getEvidenceImageDataUri(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  const bytes = new Uint8Array(await getBytes(storageRef));
  return `data:image/jpeg;base64,${bytesToBase64(bytes)}`;
}

export async function updateEvidenceCaption(evidenceId: string, caption: string): Promise<void> {
  const evidenceRef = doc(db, EVIDENCE_COLLECTION, evidenceId);
  await updateDoc(evidenceRef, { caption, updatedAt: serverTimestamp() });
}

export async function deleteEvidence(evidence: Pick<Evidence, 'id' | 'storagePath'>): Promise<void> {
  if (evidence.storagePath) {
    try {
      await deleteObject(ref(storage, evidence.storagePath));
    } catch {
      // If the storage object is already gone, still remove the Firestore
      // record rather than leaving an orphaned reference behind.
    }
  }
  await deleteDoc(doc(db, EVIDENCE_COLLECTION, evidence.id));
}
