import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getEvidenceImageDataUri } from '../services/evidenceService';
import { colors, radius, spacing, typography } from '../theme';
import { Evidence } from '../types';

interface EvidenceCardProps {
  evidence: Evidence;
  onDelete: () => void;
}

export function EvidenceCard({ evidence, onDelete }: EvidenceCardProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loadingImage, setLoadingImage] = useState(evidence.type === 'SCREENSHOT');

  useEffect(() => {
    if (evidence.type !== 'SCREENSHOT' || !evidence.storagePath) return;
    let cancelled = false;
    setLoadingImage(true);
    setImageError(false);
    getEvidenceImageDataUri(evidence.storagePath)
      .then((uri) => {
        if (!cancelled) setImageUri(uri);
      })
      .catch((err) => {
        console.error('[evidence] failed to load image', err);
        if (!cancelled) setImageError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingImage(false);
      });
    return () => {
      cancelled = true;
    };
  }, [evidence.storagePath, evidence.type]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={evidence.type === 'SCREENSHOT' ? 'image-outline' : 'document-text-outline'}
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.caption} numberOfLines={1}>
            {evidence.caption || (evidence.type === 'SCREENSHOT' ? 'Screenshot' : 'Note')}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} accessibilityRole="button" accessibilityLabel="Delete evidence">
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {evidence.type === 'SCREENSHOT' ? (
        <View style={styles.imageWrapper}>
          {loadingImage ? (
            <ActivityIndicator color={colors.primary} />
          ) : imageError || !imageUri ? (
            <View style={styles.imageError}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
              <Text style={styles.imageErrorText}>Unable to load image</Text>
            </View>
          ) : (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => {
                console.error('[evidence] Image failed to render', e.nativeEvent.error);
                setImageError(true);
              }}
            />
          )}
        </View>
      ) : (
        !!evidence.textContent && <Text style={styles.textContent}>{evidence.textContent}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  caption: {
    ...typography.bodyStrong,
    flex: 1,
  },
  imageWrapper: {
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageError: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageErrorText: {
    ...typography.caption,
    color: colors.danger,
  },
  textContent: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
