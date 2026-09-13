import { colors } from '../theme/colors';

export const ASSESSMENT_TYPES = [
  'Web Application Security Assessment',
  'Network Security Assessment',
  'API Security Assessment',
  'Vulnerability Assessment',
  'Security Configuration Review',
  'General Security Assessment',
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_STATUSES = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const ASSESSMENT_STATUS_META: Record<AssessmentStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: colors.textSecondary },
  IN_PROGRESS: { label: 'In Progress', color: colors.primary },
  COMPLETED: { label: 'Completed', color: colors.success },
  ARCHIVED: { label: 'Archived', color: colors.border },
};
