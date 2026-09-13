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
import { Finding, FindingInput } from '../types';

const FINDINGS_COLLECTION = 'findings';

export async function getFindings(ownerId: string): Promise<Finding[]> {
  const q = query(collection(db, FINDINGS_COLLECTION), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const findings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Finding);
  return findings.sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  );
}

export async function getFindingsForAssessment(ownerId: string, assessmentId: string): Promise<Finding[]> {
  const q = query(
    collection(db, FINDINGS_COLLECTION),
    where('ownerId', '==', ownerId),
    where('assessmentId', '==', assessmentId)
  );
  const snapshot = await getDocs(q);
  const findings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Finding);
  return findings.sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  );
}

export async function getFinding(findingId: string): Promise<Finding | null> {
  const ref = doc(db, FINDINGS_COLLECTION, findingId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Finding;
}

// Finding IDs are simple, human-readable per-assessment sequence numbers
// (F-001, F-002, ...) rather than the Firestore document id, so a report
// reads naturally. Based on the current count, so it's stable for a
// single-user MVP but not collision-proof under concurrent creation.
export async function createFinding(
  ownerId: string,
  assessmentId: string,
  input: FindingInput
): Promise<string> {
  const existing = await getFindingsForAssessment(ownerId, assessmentId);
  const displayId = `F-${String(existing.length + 1).padStart(3, '0')}`;

  const ref = doc(collection(db, FINDINGS_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    assessmentId,
    displayId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFinding(findingId: string, input: FindingInput): Promise<void> {
  const ref = doc(db, FINDINGS_COLLECTION, findingId);
  await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
}

export async function deleteFinding(findingId: string): Promise<void> {
  await deleteDoc(doc(db, FINDINGS_COLLECTION, findingId));
}
