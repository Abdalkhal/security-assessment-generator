import { AssessmentStatus, AssessmentType } from '../constants/assessment';
import { OwnedEntity } from './common';

export interface Assessment extends OwnedEntity {
  title: string;
  clientId: string;
  clientName: string;
  assessmentType: AssessmentType;
  startDate: string;
  endDate: string;
  description: string;
  methodology: string;
  status: AssessmentStatus;
}

export type AssessmentInput = Omit<
  Assessment,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'clientName'
>;
