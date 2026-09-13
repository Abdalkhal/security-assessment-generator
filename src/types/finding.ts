import { FindingCategory } from '../constants/findingCategory';
import { FindingStatus } from '../constants/findingStatus';
import { Severity } from '../constants/severity';
import { OwnedEntity } from './common';

export interface Finding extends OwnedEntity {
  assessmentId: string;
  displayId: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  status: FindingStatus;
  affectedAssetId?: string;
  affectedAssetName?: string;
  description: string;
  technicalDetails?: string;
  impact: string;
  recommendation: string;
  cvssScore?: number;
  cvssVector?: string;
  cwe?: string;
  owaspCategory?: string;
  references?: string;
}

export type FindingInput = Omit<
  Finding,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'assessmentId' | 'displayId'
>;
