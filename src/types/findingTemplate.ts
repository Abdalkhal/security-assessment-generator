import { FindingCategory } from '../constants/findingCategory';
import { Severity } from '../constants/severity';
import { FirestoreTimestamp } from './common';

export interface FindingTemplate {
  id: string;
  title: string;
  category: FindingCategory;
  defaultSeverity: Severity;
  description: string;
  impact: string;
  recommendation: string;
  owaspCategory?: string;
  cwe?: string;
  isBuiltIn: boolean;
  ownerId?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}
