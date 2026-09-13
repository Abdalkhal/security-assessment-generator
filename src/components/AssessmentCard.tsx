import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ASSESSMENT_STATUS_META } from '../constants/assessment';
import { Severity } from '../constants/severity';
import { Assessment } from '../types';
import { colors, radius, spacing, typography } from '../theme';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

interface AssessmentCardProps {
  assessment: Assessment;
  findingCount: number;
  overallRisk: Severity | null;
  onPress?: () => void;
}

export function AssessmentCard({ assessment, findingCount, overallRisk, onPress }: AssessmentCardProps) {
  const statusMeta = ASSESSMENT_STATUS_META[assessment.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {assessment.title}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
      <Text style={styles.client} numberOfLines={1}>
        {assessment.clientName} - {assessment.assessmentType}
      </Text>
      <View style={styles.footerRow}>
        <StatusBadge label={statusMeta.label} color={statusMeta.color} />
        {overallRisk && <SeverityBadge severity={overallRisk} />}
        <Text style={styles.findingCount}>
          {findingCount} {findingCount === 1 ? 'finding' : 'findings'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
    flex: 1,
    marginRight: spacing.sm,
  },
  client: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  findingCount: {
    ...typography.caption,
    marginLeft: 'auto',
  },
});
