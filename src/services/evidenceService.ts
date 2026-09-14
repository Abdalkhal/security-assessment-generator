import { Blob as ExpoBlob } from 'expo-blob';
import * as FileSystem from 'expo-file-system/legacy';
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
import { base64ToBytes, bytesToBase64 } from '../utils/base64';

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

  // Three approaches were tried and ruled out on-device before this one:
  // - fetch(uri).blob(): unreliable for local file:// URIs on RN.
  // - Firebase's uploadBytes/uploadString given a raw ArrayBuffer:
  //   Firebase internally does `new Blob([bytes])`, which React Native's
  //   built-in Blob does not support for ArrayBuffer/typed-array input.
  // - expo-file-system's new `File(uri).arrayBuffer()`: silently resolved
  //   to `undefined` in Expo Go on this device (no error thrown - the
  //   resulting Blob part got stringified to the literal text "undefined",
  //   which is what actually got uploaded and is why the image never
  //   rendered despite every step reporting success).
  // This combination is what actually works: expo-file-system's long
  // established *legacy* readAsStringAsync (proven reliable throughout
  // this debugging) to get base64 text, decoded to real bytes ourselves
  // (base64ToBytes, unit-tested for round-trip correctness), wrapped in
  // expo-blob's Blob (a real native-backed Blob that Firebase's SDK won't
  // try to re-wrap, unlike RN's built-in one).
  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = base64ToBytes(base64);
  console.log('[evidence] local file read', { byteLength: bytes.byteLength });
  const blob = new ExpoBlob([bytes], { type: 'image/jpeg' });
  console.log('[evidence] blob constructed', { size: blob.size, type: blob.type });

  const evidenceRef = doc(collection(db, EVIDENCE_COLLECTION));
  const storagePath = `users/${ownerId}/assessments/${assessmentId}/findings/${findingId}/evidence/${evidenceRef.id}.jpg`;
  const storageRef = ref(storage, storagePath);
  // expo-blob's Blob is functionally a real Blob at runtime (that's the
  // whole point of using it here) but its generic typing differs slightly
  // from the DOM Blob type Firebase's SDK expects (ArrayBufferLike vs
  // ArrayBuffer) - safe to assert past that mismatch.
  const uploadResult = await uploadBytes(storageRef, blob as unknown as Blob, { contentType: 'image/jpeg' });
  console.log('[evidence] upload result', {
    serverSize: uploadResult.metadata.size,
    contentType: uploadResult.metadata.contentType,
  });

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

// Reads the image via the Storage SDK (which enforces storage.rules and
// requires the caller to be authenticated as the owner) and returns a
// base64 data URI for display - deliberately never calls
// getDownloadURL(), which would hand out a token usable without further
// authorization checks.
export async function getEvidenceImageDataUri(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  const bytes = new Uint8Array(await getBytes(storageRef));
  console.log('[evidence] downloaded bytes for display', { byteLength: bytes.byteLength, first8: Array.from(bytes.slice(0, 8)) });
  const base64 = bytesToBase64(bytes);
  console.log('[evidence] base64 encoded', { length: base64.length, prefix: base64.slice(0, 20) });
  return `data:image/jpeg;base64,${base64}`;
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
