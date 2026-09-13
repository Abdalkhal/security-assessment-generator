import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FINDING_STATUS_META } from '../constants/findingStatus';
import { Finding } from '../types';
import { colors, radius, spacing, typography } from '../theme';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

interface FindingCardProps {
  finding: Finding;
  onPress?: () => void;
}

export function FindingCard({ finding, onPress }: FindingCardProps) {
  const statusMeta = FINDING_STATUS_META[finding.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {finding.title}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
      <Text style={styles.category} numberOfLines={1}>
        {finding.category}
        {finding.affectedAssetName ? ` - ${finding.affectedAssetName}` : ''}
      </Text>
      <View style={styles.footerRow}>
        <SeverityBadge severity={finding.severity} />
        <StatusBadge label={statusMeta.label} color={statusMeta.color} />
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
  category: {
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
});
