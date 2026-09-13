import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Asset, AssetInput } from '../types';

const ASSETS_COLLECTION = 'assets';

export async function getAssets(ownerId: string, assessmentId: string): Promise<Asset[]> {
  const q = query(
    collection(db, ASSETS_COLLECTION),
    where('ownerId', '==', ownerId),
    where('assessmentId', '==', assessmentId)
  );
  const snapshot = await getDocs(q);
  const assets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Asset);
  return assets.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getAsset(assetId: string): Promise<Asset | null> {
  const ref = doc(db, ASSETS_COLLECTION, assetId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Asset;
}

export async function createAsset(ownerId: string, assessmentId: string, input: AssetInput): Promise<string> {
  const ref = doc(collection(db, ASSETS_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    assessmentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAsset(assetId: string, input: AssetInput): Promise<void> {
  const ref = doc(db, ASSETS_COLLECTION, assetId);
  await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
}

export async function deleteAsset(assetId: string): Promise<void> {
  await deleteDoc(doc(db, ASSETS_COLLECTION, assetId));
}
