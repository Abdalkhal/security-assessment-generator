import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingView } from '../../components/LoadingView';
import { OptionPickerModal, PickerOption } from '../../components/OptionPickerModal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SelectInput } from '../../components/SelectInput';
import { TextField } from '../../components/TextField';
import { FINDING_CATEGORIES } from '../../constants/findingCategory';
import { FINDING_STATUS_META, FINDING_STATUSES } from '../../constants/findingStatus';
import { getFindingTemplate } from '../../constants/findingTemplates';
import { SEVERITY_META, SEVERITY_LEVELS } from '../../constants/severity';
import { useAuth } from '../../context/AuthContext';
import { getAssets } from '../../services/assetService';
import { createFinding, getFinding, updateFinding } from '../../services/findingService';
import { colors, spacing, typography } from '../../theme';
import { Asset, FindingInput } from '../../types';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'FindingForm'>;

const EMPTY_FORM: FindingInput = {
  title: '',
  category: 'Other',
  severity: 'MEDIUM',
  status: 'OPEN',
  affectedAssetId: undefined,
  affectedAssetName: undefined,
  description: '',
  technicalDetails: '',
  impact: '',
  recommendation: '',
  cvssScore: undefined,
  cvssVector: '',
  cwe: '',
  owaspCategory: '',
  references: '',
};

type ActivePicker = 'category' | 'severity' | 'status' | 'asset' | null;

export function FindingFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { assessmentId, findingId, templateId } = route.params;
  const isEditing = !!findingId;

  const [form, setForm] = useState<FindingInput>(EMPTY_FORM);
  const [cvssScoreText, setCvssScoreText] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const assetList = await getAssets(user.uid, assessmentId);
        setAssets(assetList);

        if (findingId) {
          const finding = await getFinding(findingId);
          if (finding) {
            setForm({
              title: finding.title,
              category: finding.category,
              severity: finding.severity,
              status: finding.status,
              affectedAssetId: finding.affectedAssetId,
              affectedAssetName: finding.affectedAssetName,
              description: finding.description,
              technicalDetails: finding.technicalDetails ?? '',
              impact: finding.impact,
              recommendation: finding.recommendation,
              cvssScore: finding.cvssScore,
              cvssVector: finding.cvssVector ?? '',
              cwe: finding.cwe ?? '',
              owaspCategory: finding.owaspCategory ?? '',
              references: finding.references ?? '',
            });
            setCvssScoreText(finding.cvssScore != null ? String(finding.cvssScore) : '');
          }
        } else if (templateId) {
          const template = getFindingTemplate(templateId);
          if (template) {
            setForm((prev) => ({
              ...prev,
              title: template.title,
              category: template.category,
              severity: template.defaultSeverity,
              description: template.description,
              impact: template.impact,
              recommendation: template.recommendation,
              owaspCategory: template.owaspCategory ?? '',
              cwe: template.cwe ?? '',
            }));
          }
        }
      } catch {
        setError('Unable to load finding data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentId, findingId, templateId, user]);

  const updateField = <K extends keyof FindingInput>(field: K, value: FindingInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.description.trim() || !form.impact.trim() || !form.recommendation.trim()) {
      setError('Title, description, impact, and recommendation are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const parsedScore = cvssScoreText.trim() ? Number(cvssScoreText.trim()) : undefined;
      const payload: FindingInput = {
        ...form,
        cvssScore: parsedScore != null && !Number.isNaN(parsedScore) ? parsedScore : undefined,
      };
      if (isEditing && findingId) {
        await updateFinding(findingId, payload);
      } else {
        await createFinding(user.uid, assessmentId, payload);
      }
      navigation.goBack();
    } catch {
      setError('Unable to save finding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView message="Loading..." />;

  const categoryOptions: PickerOption[] = FINDING_CATEGORIES.map((c) => ({ label: c, value: c }));
  const severityOptions: PickerOption[] = SEVERITY_LEVELS.map((s) => ({ label: SEVERITY_META[s].label, value: s }));
  const statusOptions: PickerOption[] = FINDING_STATUSES.map((s) => ({ label: FINDING_STATUS_META[s].label, value: s }));
  const assetOptions: PickerOption[] = assets.map((a) => ({ label: a.name, value: a.id }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Finding' : 'New Finding'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextField
            label="Title *"
            placeholder="Reflected XSS in search parameter"
            value={form.title}
            onChangeText={(v) => updateField('title', v)}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <SelectInput label="Category" value={form.category} onPress={() => setActivePicker('category')} />
            </View>
            <View style={styles.rowItem}>
              <SelectInput
                label="Severity *"
                value={SEVERITY_META[form.severity].label}
                onPress={() => setActivePicker('severity')}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <SelectInput
                label="Status"
                value={FINDING_STATUS_META[form.status].label}
                onPress={() => setActivePicker('status')}
              />
            </View>
            <View style={styles.rowItem}>
              <SelectInput
                label="Affected Asset"
                placeholder={assets.length === 0 ? 'No assets added' : 'Select asset'}
                value={form.affectedAssetName}
                onPress={() => setActivePicker('asset')}
              />
            </View>
          </View>

          <TextField
            label="Description *"
            placeholder="What is the vulnerability and how was it identified?"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <TextField
            label="Technical Details"
            placeholder="Request/response, payloads, steps to reproduce"
            value={form.technicalDetails}
            onChangeText={(v) => updateField('technicalDetails', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <TextField
            label="Impact *"
            placeholder="What could an attacker achieve?"
            value={form.impact}
            onChangeText={(v) => updateField('impact', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <TextField
            label="Recommendation *"
            placeholder="How should this be remediated?"
            value={form.recommendation}
            onChangeText={(v) => updateField('recommendation', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField
                label="CVSS Score"
                placeholder="e.g. 7.5"
                keyboardType="decimal-pad"
                value={cvssScoreText}
                onChangeText={setCvssScoreText}
              />
            </View>
            <View style={styles.rowItem}>
              <TextField
                label="CWE"
                placeholder="e.g. CWE-79"
                value={form.cwe}
                onChangeText={(v) => updateField('cwe', v)}
              />
            </View>
          </View>

          <TextField
            label="CVSS Vector"
            placeholder="e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N"
            autoCapitalize="none"
            value={form.cvssVector}
            onChangeText={(v) => updateField('cvssVector', v)}
          />

          <TextField
            label="OWASP Category"
            placeholder="e.g. A03:2021 - Injection"
            value={form.owaspCategory}
            onChangeText={(v) => updateField('owaspCategory', v)}
          />

          <TextField
            label="References"
            placeholder="One URL per line"
            autoCapitalize="none"
            value={form.references}
            onChangeText={(v) => updateField('references', v)}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton label={isEditing ? 'Save Changes' : 'Create Finding'} onPress={handleSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionPickerModal
        visible={activePicker === 'category'}
        title="Category"
        options={categoryOptions}
        selectedValue={form.category}
        onSelect={(v) => {
          updateField('category', v as FindingInput['category']);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
      <OptionPickerModal
        visible={activePicker === 'severity'}
        title="Severity"
        options={severityOptions}
        selectedValue={form.severity}
        onSelect={(v) => {
          updateField('severity', v as FindingInput['severity']);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
      <OptionPickerModal
        visible={activePicker === 'status'}
        title="Status"
        options={statusOptions}
        selectedValue={form.status}
        onSelect={(v) => {
          updateField('status', v as FindingInput['status']);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
      <OptionPickerModal
        visible={activePicker === 'asset'}
        title="Affected Asset"
        options={assetOptions}
        selectedValue={form.affectedAssetId}
        onSelect={(v) => {
          const asset = assets.find((a) => a.id === v);
          updateField('affectedAssetId', v);
          updateField('affectedAssetName', asset?.name);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
        emptyMessage="No assets added to this assessment yet."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
  },
  form: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  multilineInput: {
    height: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
