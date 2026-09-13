import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { SeverityBadge } from '../../components/SeverityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { FINDING_STATUS_META } from '../../constants/findingStatus';
import { deleteFinding, getFinding } from '../../services/findingService';
import { colors, radius, spacing, typography } from '../../theme';
import { Finding } from '../../types';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'FindingDetail'>;

export function FindingDetailScreen({ navigation, route }: Props) {
  const { findingId } = route.params;
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFinding(findingId);
      setFinding(data);
    } catch {
      setError('Unable to load finding.');
    } finally {
      setLoading(false);
    }
  }, [findingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFinding(findingId);
      setConfirmVisible(false);
      navigation.goBack();
    } catch {
      setError('Unable to delete finding.');
      setConfirmVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingView message="Loading finding..." />;
  if (error && !finding) return <ErrorView message={error} onRetry={load} />;
  if (!finding) return <ErrorView message="Finding not found." />;

  const statusMeta = FINDING_STATUS_META[finding.status];
  const references = (finding.references ?? '')
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('FindingForm', { assessmentId: finding.assessmentId, findingId })}
            accessibilityRole="button"
            accessibilityLabel="Edit finding"
            style={styles.headerActionButton}
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete finding"
            style={styles.headerActionButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.displayId}>{finding.displayId}</Text>
        <Text style={styles.title}>{finding.title}</Text>
        <View style={styles.badgeRow}>
          <SeverityBadge severity={finding.severity} />
          <StatusBadge label={statusMeta.label} color={statusMeta.color} />
        </View>

        <View style={styles.card}>
          <InfoRow label="Category" value={finding.category} />
          <InfoRow label="Affected Asset" value={finding.affectedAssetName || 'Not specified'} />
          {finding.cvssScore != null && <InfoRow label="CVSS Score" value={String(finding.cvssScore)} />}
          {!!finding.cvssVector && <InfoRow label="CVSS Vector" value={finding.cvssVector} />}
          {!!finding.cwe && <InfoRow label="CWE" value={finding.cwe} />}
          {!!finding.owaspCategory && <InfoRow label="OWASP Category" value={finding.owaspCategory} />}
        </View>

        <Section title="Description" body={finding.description} />
        {!!finding.technicalDetails && <Section title="Technical Details" body={finding.technicalDetails} mono />}
        <Section title="Impact" body={finding.impact} />
        <Section title="Recommendation" body={finding.recommendation} />

        {references.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>References</Text>
            {references.map((ref) => (
              <Text key={ref} style={styles.reference} numberOfLines={1}>
                {ref}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Evidence</Text>
          </View>
          <Text style={styles.bodyTextMuted}>Evidence attachments are available starting Stage 5.</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete finding?"
        message={`This will permanently delete "${finding.title}". This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, body, mono = false }: { title: string; body: string; mono?: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={mono ? styles.monoText : styles.bodyText}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerActionButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  displayId: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.caption,
  },
  infoValue: {
    ...typography.body,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bodyTextMuted: {
    ...typography.caption,
  },
  monoText: {
    ...typography.mono,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reference: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
