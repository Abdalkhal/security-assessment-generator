import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'] as const;
export type Severity = (typeof SEVERITY_LEVELS)[number];

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; weight: number }
> = {
  // icon is typed against Ionicons' own name union (not a bare `string`) so
  // a typo'd or wrong-icon-set name fails `tsc`, the way it already did for
  // AssetCard's icon map, instead of silently rendering nothing at runtime.
  CRITICAL: { label: 'Critical', color: colors.critical, icon: 'alert-circle', weight: 5 },
  HIGH: { label: 'High', color: colors.danger, icon: 'warning', weight: 4 },
  MEDIUM: { label: 'Medium', color: colors.warning, icon: 'alert-circle-outline', weight: 3 },
  LOW: { label: 'Low', color: colors.primary, icon: 'information-circle-outline', weight: 2 },
  INFORMATIONAL: { label: 'Informational', color: colors.textSecondary, icon: 'document-text-outline', weight: 1 },
};
