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
import { db } from '../firebase/config';
import { ScopeItem, ScopeItemInput } from '../types';

const SCOPE_COLLECTION = 'scope';

export async function getScopeItems(ownerId: string, assessmentId: string): Promise<ScopeItem[]> {
  const q = query(
    collection(db, SCOPE_COLLECTION),
    where('ownerId', '==', ownerId),
    where('assessmentId', '==', assessmentId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ScopeItem);
  return items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function createScopeItem(
  ownerId: string,
  assessmentId: string,
  input: ScopeItemInput
): Promise<string> {
  const ref = doc(collection(db, SCOPE_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    assessmentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateScopeItem(scopeItemId: string, input: ScopeItemInput): Promise<void> {
  const ref = doc(db, SCOPE_COLLECTION, scopeItemId);
  await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
}

export async function deleteScopeItem(scopeItemId: string): Promise<void> {
  await deleteDoc(doc(db, SCOPE_COLLECTION, scopeItemId));
}
