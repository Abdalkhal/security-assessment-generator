import { OwnedEntity } from './common';

export interface ReportRecord extends OwnedEntity {
  assessmentId: string;
  assessmentTitle: string;
  clientName: string;
  overallRisk: string;
  generatedAt: string;
}
