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
import { AssessmentStatus } from '../constants/assessment';
import { Assessment, AssessmentInput } from '../types';

const ASSESSMENTS_COLLECTION = 'assessments';

export async function getAssessments(ownerId: string): Promise<Assessment[]> {
  const q = query(collection(db, ASSESSMENTS_COLLECTION), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const assessments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Assessment);
  return assessments.sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  );
}

export async function getAssessmentsForClient(ownerId: string, clientId: string): Promise<Assessment[]> {
  const all = await getAssessments(ownerId);
  return all.filter((a) => a.clientId === clientId);
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const ref = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Assessment;
}

export async function createAssessment(ownerId: string, input: AssessmentInput & { clientName: string }): Promise<string> {
  const ref = doc(collection(db, ASSESSMENTS_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAssessment(
  assessmentId: string,
  input: AssessmentInput & { clientName: string }
): Promise<void> {
  const ref = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function setAssessmentStatus(assessmentId: string, status: AssessmentStatus): Promise<void> {
  const ref = doc(db, ASSESSMENTS_COLLECTION, assessmentId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  await deleteDoc(doc(db, ASSESSMENTS_COLLECTION, assessmentId));
}
