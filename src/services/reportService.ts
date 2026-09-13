import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReportRecord } from '../types';

const REPORTS_COLLECTION = 'reports';

export async function getReports(ownerId: string): Promise<ReportRecord[]> {
  const q = query(collection(db, REPORTS_COLLECTION), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportRecord);
  return reports.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function createReportRecord(
  ownerId: string,
  input: {
    assessmentId: string;
    assessmentTitle: string;
    clientName: string;
    overallRisk: string;
    generatedAt: string;
  }
): Promise<string> {
  const ref = doc(collection(db, REPORTS_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}
