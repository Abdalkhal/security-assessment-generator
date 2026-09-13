import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssetCard } from '../../components/AssetCard';
import { AssetFormModal } from '../../components/AssetFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorView } from '../../components/ErrorView';
import { FindingCard } from '../../components/FindingCard';
import { LoadingView } from '../../components/LoadingView';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScopeFormModal } from '../../components/ScopeFormModal';
import { ScopeItemRow } from '../../components/ScopeItemRow';
import { StatusBadge } from '../../components/StatusBadge';
import { ASSESSMENT_STATUS_META } from '../../constants/assessment';
import { SEVERITY_LEVELS, SEVERITY_META } from '../../constants/severity';
import { useAuth } from '../../context/AuthContext';
import { deleteAssessment, getAssessment } from '../../services/assessmentService';
import { createAsset, deleteAsset, getAssets, updateAsset } from '../../services/assetService';
import { getFindingsForAssessment } from '../../services/findingService';
import { createScopeItem, deleteScopeItem, getScopeItems, updateScopeItem } from '../../services/scopeService';
import { colors, radius, spacing, typography } from '../../theme';
import { Asset, Assessment, Finding, ScopeItem } from '../../types';
import { countBySeverity } from '../../utils/risk';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'AssessmentDetail'>;

type Tab = 'overview' | 'scope' | 'assets' | 'findings';

export function AssessmentDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { assessmentId } = route.params;

  const [tab, setTab] = useState<Tab>('overview');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [scopeModalVisible, setScopeModalVisible] = useState(false);
  const [editingScopeItem, setEditingScopeItem] = useState<ScopeItem | null>(null);
  const [scopeSaving, setScopeSaving] = useState(false);
  const [scopeDeleteTarget, setScopeDeleteTarget] = useState<ScopeItem | null>(null);

  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetSaving, setAssetSaving] = useState(false);
  const [assetDeleteTarget, setAssetDeleteTarget] = useState<Asset | null>(null);

  const [createFindingChoiceVisible, setCreateFindingChoiceVisible] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [assessmentData, findingData, scopeData, assetData] = await Promise.all([
        getAssessment(assessmentId),
        getFindingsForAssessment(user.uid, assessmentId),
        getScopeItems(user.uid, assessmentId),
        getAssets(user.uid, assessmentId),
      ]);
      setAssessment(assessmentData);
      setFindings(findingData);
      setScopeItems(scopeData);
      setAssets(assetData);
    } catch {
      setError('Unable to load assessment details.');
    } finally {
      setLoading(false);
    }
  }, [assessmentId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const severityCounts = useMemo(() => countBySeverity(findings), [findings]);
  const resolvedCount = findings.filter((f) => f.status === 'RESOLVED' || f.status === 'ACCEPTED' || f.status === 'FALSE_POSITIVE').length;

  const handleDeleteAssessment = async () => {
    setDeleting(true);
    try {
      await deleteAssessment(assessmentId);
      setDeleteConfirmVisible(false);
      navigation.goBack();
    } catch {
      setError('Unable to delete assessment. Please try again.');
      setDeleteConfirmVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveScopeItem = async (input: Parameters<typeof createScopeItem>[2]) => {
    if (!user) return;
    setScopeSaving(true);
    try {
      if (editingScopeItem) {
        await updateScopeItem(editingScopeItem.id, input);
      } else {
        await createScopeItem(user.uid, assessmentId, input);
      }
      setScopeModalVisible(false);
      setEditingScopeItem(null);
      await load();
    } catch {
      setError('Unable to save scope item.');
    } finally {
      setScopeSaving(false);
    }
  };

  const handleDeleteScopeItem = async () => {
    if (!scopeDeleteTarget) return;
    try {
      await deleteScopeItem(scopeDeleteTarget.id);
      setScopeDeleteTarget(null);
      await load();
    } catch {
      setError('Unable to delete scope item.');
      setScopeDeleteTarget(null);
    }
  };

  const handleSaveAsset = async (input: Parameters<typeof createAsset>[2]) => {
    if (!user) return;
    setAssetSaving(true);
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, input);
      } else {
        await createAsset(user.uid, assessmentId, input);
      }
      setAssetModalVisible(false);
      setEditingAsset(null);
      await load();
    } catch {
      setError('Unable to save asset.');
    } finally {
      setAssetSaving(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetDeleteTarget) return;
    try {
      await deleteAsset(assetDeleteTarget.id);
      setAssetDeleteTarget(null);
      await load();
    } catch {
      setError('Unable to delete asset.');
      setAssetDeleteTarget(null);
    }
  };

  if (loading) return <LoadingView message="Loading assessment..." />;
  if (error && !assessment) return <ErrorView message={error} onRetry={load} />;
  if (!assessment) return <ErrorView message="Assessment not found." />;

  const statusMeta = ASSESSMENT_STATUS_META[assessment.status];
  const inScopeItems = scopeItems.filter((s) => s.side === 'IN_SCOPE');
  const outScopeItems = scopeItems.filter((s) => s.side === 'OUT_OF_SCOPE');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AssessmentForm', { assessmentId })}
            accessibilityRole="button"
            accessibilityLabel="Edit assessment"
            style={styles.headerActionButton}
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteConfirmVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete assessment"
            style={styles.headerActionButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {assessment.title}
        </Text>
        <Text style={styles.subtitle}>
          {assessment.clientName} - {assessment.assessmentType}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {(['overview', 'scope', 'assets', 'findings'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tabButton, tab === t && styles.tabButtonActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'overview'
                ? 'Overview'
                : t === 'scope'
                ? 'Scope'
                : t === 'assets'
                ? 'Assets'
                : `Findings (${findings.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === 'overview' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <InfoRow label="Status" value={<StatusBadge label={statusMeta.label} color={statusMeta.color} />} />
            <InfoRow label="Start Date" value={<Text style={styles.infoValueText}>{assessment.startDate || 'Not set'}</Text>} />
            <InfoRow label="End Date" value={<Text style={styles.infoValueText}>{assessment.endDate || 'Not set'}</Text>} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bodyText}>{assessment.description || 'No description provided.'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Methodology</Text>
            <Text style={styles.bodyText}>{assessment.methodology || 'No methodology provided.'}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Risk Summary</Text>
              <Text style={styles.findingTotal}>{findings.length} findings</Text>
            </View>
            {findings.length === 0 ? (
              <Text style={styles.bodyText}>No findings recorded yet.</Text>
            ) : (
              SEVERITY_LEVELS.map((level) => {
                const meta = SEVERITY_META[level];
                const count = severityCounts[level];
                if (count === 0) return null;
                return (
                  <View key={level} style={styles.riskRow}>
                    <View style={styles.riskLabelRow}>
                      <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                      <Text style={styles.riskLabel}>{meta.label}</Text>
                    </View>
                    <Text style={[styles.riskValue, { color: meta.color }]}>{count}</Text>
                  </View>
                );
              })
            )}
            {findings.length > 0 && (
              <Text style={styles.progressText}>
                {resolvedCount} of {findings.length} findings resolved, accepted, or marked false positive
              </Text>
            )}
          </View>

          <PrimaryButton
            label="Generate Report"
            onPress={() => {}}
            disabled
            style={styles.generateButton}
          />
          <Text style={styles.generateHint}>Report generation is available starting Stage 5.</Text>
        </ScrollView>
      )}

      {tab === 'scope' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>In Scope ({inScopeItems.length})</Text>
          </View>
          {inScopeItems.length === 0 ? (
            <Text style={styles.bodyText}>No in-scope items added yet.</Text>
          ) : (
            inScopeItems.map((item) => (
              <ScopeItemRow
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditingScopeItem(item);
                  setScopeModalVisible(true);
                }}
                onDelete={() => setScopeDeleteTarget(item)}
              />
            ))
          )}

          <View style={[styles.sectionHeaderRow, styles.sectionSpacer]}>
            <Text style={styles.sectionTitle}>Out of Scope ({outScopeItems.length})</Text>
          </View>
          {outScopeItems.length === 0 ? (
            <Text style={styles.bodyText}>No out-of-scope items added yet.</Text>
          ) : (
            outScopeItems.map((item) => (
              <ScopeItemRow
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditingScopeItem(item);
                  setScopeModalVisible(true);
                }}
                onDelete={() => setScopeDeleteTarget(item)}
              />
            ))
          )}

          <PrimaryButton
            label="Add Scope Item"
            onPress={() => {
              setEditingScopeItem(null);
              setScopeModalVisible(true);
            }}
            style={styles.addSectionButton}
          />
        </ScrollView>
      )}

      {tab === 'assets' && (
        <ScrollView contentContainerStyle={styles.content}>
          {assets.length === 0 ? (
            <Text style={styles.bodyText}>No assets added yet.</Text>
          ) : (
            assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={() => {
                  setEditingAsset(asset);
                  setAssetModalVisible(true);
                }}
                onDelete={() => setAssetDeleteTarget(asset)}
              />
            ))
          )}
          <PrimaryButton
            label="Add Asset"
            onPress={() => {
              setEditingAsset(null);
              setAssetModalVisible(true);
            }}
            style={styles.addSectionButton}
          />
        </ScrollView>
      )}

      {tab === 'findings' && (
        <ScrollView contentContainerStyle={styles.content}>
          {findings.length === 0 ? (
            <Text style={styles.bodyText}>No findings recorded yet.</Text>
          ) : (
            findings.map((f) => (
              <FindingCard
                key={f.id}
                finding={f}
                onPress={() => navigation.navigate('FindingDetail', { findingId: f.id })}
              />
            ))
          )}
          <PrimaryButton
            label="Add Finding"
            onPress={() => setCreateFindingChoiceVisible(true)}
            style={styles.addSectionButton}
          />
        </ScrollView>
      )}

      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete assessment?"
        message={`This will permanently delete "${assessment.title}" along with its scope and assets. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDeleteAssessment}
        onCancel={() => setDeleteConfirmVisible(false)}
      />

      <ScopeFormModal
        visible={scopeModalVisible}
        initialItem={editingScopeItem}
        saving={scopeSaving}
        onSave={handleSaveScopeItem}
        onClose={() => {
          setScopeModalVisible(false);
          setEditingScopeItem(null);
        }}
      />
      <ConfirmDialog
        visible={!!scopeDeleteTarget}
        title="Delete scope item?"
        message={`Remove "${scopeDeleteTarget?.value}" from scope?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteScopeItem}
        onCancel={() => setScopeDeleteTarget(null)}
      />

      <AssetFormModal
        visible={assetModalVisible}
        initialAsset={editingAsset}
        saving={assetSaving}
        onSave={handleSaveAsset}
        onClose={() => {
          setAssetModalVisible(false);
          setEditingAsset(null);
        }}
      />
      <ConfirmDialog
        visible={!!assetDeleteTarget}
        title="Delete asset?"
        message={`Remove "${assetDeleteTarget?.name}" from this assessment?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteAsset}
        onCancel={() => setAssetDeleteTarget(null)}
      />

      <OptionPickerModal
        visible={createFindingChoiceVisible}
        title="Add Finding"
        options={[
          { label: 'Create Manually', value: 'manual', description: 'Start from a blank finding' },
          { label: 'Use Finding Template', value: 'template', description: 'Start from the built-in library' },
        ]}
        onSelect={(value) => {
          setCreateFindingChoiceVisible(false);
          if (value === 'template') {
            navigation.navigate('FindingLibrary', { assessmentId });
          } else {
            navigation.navigate('FindingForm', { assessmentId });
          }
        }}
        onClose={() => setCreateFindingChoiceVisible(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {value}
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
  titleBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingVertical: spacing.md,
    marginRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
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
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.caption,
  },
  infoValueText: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSpacer: {
    marginTop: spacing.lg,
  },
  findingTotal: {
    ...typography.caption,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  riskLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  riskLabel: {
    ...typography.body,
  },
  riskValue: {
    ...typography.bodyStrong,
  },
  progressText: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  generateButton: {
    marginTop: spacing.sm,
  },
  generateHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  addSectionButton: {
    marginTop: spacing.md,
  },
});
