import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Assessment } from '../types';

const ASSESSMENTS_COLLECTION = 'assessments';

// Full CRUD for assessments is added in Stage 3. For now this only reads,
// which is enough for the Dashboard's statistics and risk overview.
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
