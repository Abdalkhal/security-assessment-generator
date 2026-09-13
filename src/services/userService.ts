import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  input: { name: string; company: string; phone: string; website: string }
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, { ...input, updatedAt: serverTimestamp() });
}
