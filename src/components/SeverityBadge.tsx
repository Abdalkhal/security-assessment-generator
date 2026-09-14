import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SEVERITY_META, Severity } from '../constants/severity';
import { radius, spacing, typography } from '../theme';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}55` }]}>
      <Ionicons name={meta.icon} size={12} color={meta.color} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
  },
});
