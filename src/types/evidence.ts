import { OwnedEntity } from './common';

export type EvidenceType = 'SCREENSHOT' | 'TEXT' | 'HTTP_EXCHANGE' | 'COMMAND_OUTPUT' | 'NOTE';

export interface Evidence extends OwnedEntity {
  findingId: string;
  assessmentId: string;
  type: EvidenceType;
  caption: string;
  textContent?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
}

export type EvidenceInput = Omit<
  Evidence,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'findingId' | 'assessmentId'
>;
