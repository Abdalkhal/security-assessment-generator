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
import { Client, ClientInput } from '../types';

const CLIENTS_COLLECTION = 'clients';

// Sorted client-side (rather than via an orderBy() query) so this doesn't
// depend on a Firestore composite index being created for every
// ownerId + timestamp combination - keeps setup to just the security rules.
export async function getClients(ownerId: string): Promise<Client[]> {
  const q = query(collection(db, CLIENTS_COLLECTION), where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);
  const clients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Client);
  return clients.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
}

export async function getClient(clientId: string): Promise<Client | null> {
  const ref = doc(db, CLIENTS_COLLECTION, clientId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Client;
}

export async function createClient(ownerId: string, input: ClientInput): Promise<string> {
  const ref = doc(collection(db, CLIENTS_COLLECTION));
  await setDoc(ref, {
    ...input,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateClient(clientId: string, input: ClientInput): Promise<void> {
  const ref = doc(db, CLIENTS_COLLECTION, clientId);
  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(clientId: string): Promise<void> {
  await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
}
