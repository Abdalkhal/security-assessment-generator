import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Finding } from '../types';

const FINDINGS_COLLECTION = 'findings';

// Full CRUD for findings is added in Stage 4. For now this only reads,
// which is enough for the Dashboard's statistics and risk overview.
export async function getFindings(ownerId: string): Promise<Finding[]> {
  const q = query(collection(db, FINDINGS_COLLECTION), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const findings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Finding);
  return findings.sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  );
}
