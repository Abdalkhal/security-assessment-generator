import { colors } from '../theme/colors';

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; icon: string; weight: number }
> = {
  CRITICAL: { label: 'Critical', color: colors.critical, icon: 'alert-octagon', weight: 5 },
  HIGH: { label: 'High', color: colors.danger, icon: 'alert-triangle', weight: 4 },
  MEDIUM: { label: 'Medium', color: colors.warning, icon: 'alert-circle', weight: 3 },
  LOW: { label: 'Low', color: colors.primary, icon: 'info', weight: 2 },
  INFORMATIONAL: { label: 'Informational', color: colors.textSecondary, icon: 'file-text', weight: 1 },
};
