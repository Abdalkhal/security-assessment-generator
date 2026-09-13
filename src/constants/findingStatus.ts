import { colors } from '../theme/colors';

export const FINDING_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'ACCEPTED',
  'FALSE_POSITIVE',
] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const FINDING_STATUS_META: Record<FindingStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: colors.danger },
  IN_PROGRESS: { label: 'In Progress', color: colors.warning },
  RESOLVED: { label: 'Resolved', color: colors.success },
  ACCEPTED: { label: 'Accepted', color: colors.primary },
  FALSE_POSITIVE: { label: 'False Positive', color: colors.textSecondary },
};
