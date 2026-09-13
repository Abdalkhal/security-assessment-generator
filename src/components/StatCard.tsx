import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  accentColor?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, icon, accentColor = colors.primary, style }: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {!!icon && (
          <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}22` }]}>
            <Ionicons name={icon} size={14} color={accentColor} />
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.h2,
  },
});
