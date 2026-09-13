import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScopeItem } from '../types';
import { colors, radius, spacing, typography } from '../theme';

interface ScopeItemRowProps {
  item: ScopeItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScopeItemRow({ item, onEdit, onDelete }: ScopeItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.value} numberOfLines={1}>
          {item.value}
        </Text>
        <Text style={styles.meta}>{item.type}</Text>
        {!!item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel="Edit scope item" style={styles.actionButton}>
          <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete scope item"
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
  },
  value: {
    ...typography.bodyStrong,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
  notes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
