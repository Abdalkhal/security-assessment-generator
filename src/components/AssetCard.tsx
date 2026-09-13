import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Asset } from '../types';
import { colors, radius, spacing, typography } from '../theme';

const ASSET_ICONS: Record<Asset['type'], keyof typeof Ionicons.glyphMap> = {
  'Web Application': 'globe-outline',
  API: 'code-slash-outline',
  Server: 'server-outline',
  'Network Device': 'hardware-chip-outline',
  Domain: 'link-outline',
  'IP Address': 'locate-outline',
  Other: 'cube-outline',
};

interface AssetCardProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name={ASSET_ICONS[asset.type] ?? 'cube-outline'} size={18} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {asset.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {asset.type} - {asset.environment}
        </Text>
        {!!asset.location && (
          <Text style={styles.location} numberOfLines={1}>
            {asset.location}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel="Edit asset" style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete asset"
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  name: {
    ...typography.bodyStrong,
  },
  meta: {
    ...typography.caption,
    marginTop: 2,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
