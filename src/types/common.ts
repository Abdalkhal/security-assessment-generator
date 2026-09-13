import { Timestamp } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp;

export interface OwnedEntity {
  id: string;
  ownerId: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export type Plan = 'FREE' | 'PRO' | 'CONSULTANT';
