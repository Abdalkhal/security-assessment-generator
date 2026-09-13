import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorView } from '../../components/ErrorView';
import { EvidenceCard } from '../../components/EvidenceCard';
import { LoadingView } from '../../components/LoadingView';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { SeverityBadge } from '../../components/SeverityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { TextEvidenceFormModal } from '../../components/TextEvidenceFormModal';
import { FINDING_STATUS_META } from '../../constants/findingStatus';
import { useAuth } from '../../context/AuthContext';
import {
  createScreenshotEvidence,
  createTextEvidence,
  deleteEvidence,
  getEvidenceForFinding,
} from '../../services/evidenceService';
import { deleteFinding, getFinding } from '../../services/findingService';
import { colors, radius, spacing, typography } from '../../theme';
import { Evidence, Finding } from '../../types';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'FindingDetail'>;

export function FindingDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { findingId } = route.params;
  const [finding, setFinding] = useState<Finding | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [addEvidenceChoiceVisible, setAddEvidenceChoiceVisible] = useState(false);
  const [textEvidenceModalVisible, setTextEvidenceModalVisible] = useState(false);
  const [evidenceSaving, setEvidenceSaving] = useState(false);
  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceDeleteTarget, setEvidenceDeleteTarget] = useState<Evidence | null>(null);
  const [evidenceError, setEvidenceError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getFinding(findingId);
      setFinding(data);
      const evidenceData = await getEvidenceForFinding(user.uid, findingId);
      setEvidence(evidenceData);
    } catch {
      setError('Unable to load finding.');
    } finally {
      setLoading(false);
    }
  }, [findingId, user]);

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

  const pickImage = async (source: 'camera' | 'library') => {
    if (!user || !finding) return;
    setEvidenceError('');

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setEvidenceError('Permission is required to add a screenshot.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (result.canceled || !result.assets?.[0]) return;

    setEvidenceUploading(true);
    try {
      await createScreenshotEvidence(user.uid, finding.assessmentId, finding.id, {
        caption: 'Screenshot',
        localUri: result.assets[0].uri,
      });
      await load();
    } catch {
      setEvidenceError('Unable to upload screenshot. Please try again.');
    } finally {
      setEvidenceUploading(false);
    }
  };

  const handleSaveTextEvidence = async (input: { caption: string; textContent: string }) => {
    if (!user || !finding) return;
    setEvidenceSaving(true);
    try {
      await createTextEvidence(user.uid, finding.assessmentId, finding.id, input);
      setTextEvidenceModalVisible(false);
      await load();
    } catch {
      setEvidenceError('Unable to save note. Please try again.');
    } finally {
      setEvidenceSaving(false);
    }
  };

  const handleDeleteEvidence = async () => {
    if (!evidenceDeleteTarget) return;
    try {
      await deleteEvidence(evidenceDeleteTarget);
      setEvidenceDeleteTarget(null);
      await load();
    } catch {
      setEvidenceError('Unable to delete evidence.');
      setEvidenceDeleteTarget(null);
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
            <TouchableOpacity
              onPress={() => setAddEvidenceChoiceVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Add evidence"
              disabled={evidenceUploading}
            >
              {evidenceUploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          {!!evidenceError && <Text style={styles.evidenceErrorText}>{evidenceError}</Text>}
          {evidence.length === 0 ? (
            <Text style={styles.bodyTextMuted}>No evidence added yet.</Text>
          ) : (
            evidence.map((item) => (
              <EvidenceCard key={item.id} evidence={item} onDelete={() => setEvidenceDeleteTarget(item)} />
            ))
          )}
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

      <OptionPickerModal
        visible={addEvidenceChoiceVisible}
        title="Add Evidence"
        options={[
          { label: 'Take Photo', value: 'camera', description: 'Capture a new screenshot with the camera' },
          { label: 'Choose from Library', value: 'library', description: 'Pick an existing screenshot' },
          { label: 'Add Text Note', value: 'text', description: 'Record a command output or observation' },
        ]}
        onSelect={(value) => {
          setAddEvidenceChoiceVisible(false);
          if (value === 'text') {
            setTextEvidenceModalVisible(true);
          } else {
            pickImage(value as 'camera' | 'library');
          }
        }}
        onClose={() => setAddEvidenceChoiceVisible(false)}
      />

      <TextEvidenceFormModal
        visible={textEvidenceModalVisible}
        saving={evidenceSaving}
        onSave={handleSaveTextEvidence}
        onClose={() => setTextEvidenceModalVisible(false)}
      />

      <ConfirmDialog
        visible={!!evidenceDeleteTarget}
        title="Delete evidence?"
        message="This will permanently remove this evidence item. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteEvidence}
        onCancel={() => setEvidenceDeleteTarget(null)}
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
  evidenceErrorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
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
