import { FirestoreTimestamp, Plan } from './common';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  website: string;
  logoUrl?: string;
  plan: Plan;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface ReportSettings {
  preparedBy: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
}
