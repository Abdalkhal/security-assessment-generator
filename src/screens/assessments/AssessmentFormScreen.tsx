import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateField } from '../../components/DateField';
import { LoadingView } from '../../components/LoadingView';
import { OptionPickerModal, PickerOption } from '../../components/OptionPickerModal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SelectInput } from '../../components/SelectInput';
import { TextField } from '../../components/TextField';
import { ASSESSMENT_STATUS_META, ASSESSMENT_STATUSES, ASSESSMENT_TYPES } from '../../constants/assessment';
import { useAuth } from '../../context/AuthContext';
import { getAssessment, createAssessment, updateAssessment } from '../../services/assessmentService';
import { getClients } from '../../services/clientService';
import { colors, spacing, typography } from '../../theme';
import { AssessmentInput, Client } from '../../types';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'AssessmentForm'>;

const EMPTY_FORM: AssessmentInput = {
  title: '',
  clientId: '',
  assessmentType: 'Web Application Security Assessment',
  startDate: '',
  endDate: '',
  description: '',
  methodology: '',
  status: 'DRAFT',
};

type ActivePicker = 'client' | 'type' | 'status' | null;

export function AssessmentFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const assessmentId = route.params?.assessmentId;
  const isEditing = !!assessmentId;

  const [form, setForm] = useState<AssessmentInput>({
    ...EMPTY_FORM,
    clientId: route.params?.clientId ?? '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [clientList, assessment] = await Promise.all([
          getClients(user.uid),
          assessmentId ? getAssessment(assessmentId) : Promise.resolve(null),
        ]);
        setClients(clientList);
        if (assessment) {
          setForm({
            title: assessment.title,
            clientId: assessment.clientId,
            assessmentType: assessment.assessmentType,
            startDate: assessment.startDate,
            endDate: assessment.endDate,
            description: assessment.description,
            methodology: assessment.methodology,
            status: assessment.status,
          });
        }
      } catch {
        setError('Unable to load assessment data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentId, user]);

  const updateField = <K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedClient = clients.find((c) => c.id === form.clientId);

  const handleSave = async () => {
    if (!user) return;
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.clientId) {
      setError('Please select a client.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const clientName = selectedClient?.companyName ?? '';
      if (isEditing && assessmentId) {
        await updateAssessment(assessmentId, { ...form, clientName });
      } else {
        await createAssessment(user.uid, { ...form, clientName });
      }
      navigation.goBack();
    } catch {
      setError('Unable to save assessment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView message="Loading..." />;

  const clientOptions: PickerOption[] = clients.map((c) => ({ label: c.companyName, value: c.id }));
  const typeOptions: PickerOption[] = ASSESSMENT_TYPES.map((t) => ({ label: t, value: t }));
  const statusOptions: PickerOption[] = ASSESSMENT_STATUSES.map((s) => ({
    label: ASSESSMENT_STATUS_META[s].label,
    value: s,
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Assessment' : 'New Assessment'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextField
            label="Title *"
            placeholder="Q3 External Penetration Test"
            value={form.title}
            onChangeText={(v) => updateField('title', v)}
          />

          <SelectInput
            label="Client *"
            placeholder={clients.length === 0 ? 'No clients yet - add one first' : 'Select client'}
            value={selectedClient?.companyName}
            onPress={() => setActivePicker('client')}
          />

          <SelectInput
            label="Assessment Type"
            value={form.assessmentType}
            onPress={() => setActivePicker('type')}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateFieldWrapper}>
              <DateField
                label="Start Date"
                value={form.startDate}
                onChange={(v) => updateField('startDate', v)}
              />
            </View>
            <View style={styles.dateFieldWrapper}>
              <DateField label="End Date" value={form.endDate} onChange={(v) => updateField('endDate', v)} />
            </View>
          </View>

          <SelectInput
            label="Status"
            value={ASSESSMENT_STATUS_META[form.status].label}
            onPress={() => setActivePicker('status')}
          />

          <TextField
            label="Description"
            placeholder="What is the objective of this assessment?"
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          <TextField
            label="Methodology"
            placeholder="e.g. OWASP Testing Guide, PTES"
            value={form.methodology}
            onChangeText={(v) => updateField('methodology', v)}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton
            label={isEditing ? 'Save Changes' : 'Create Assessment'}
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionPickerModal
        visible={activePicker === 'client'}
        title="Select Client"
        options={clientOptions}
        selectedValue={form.clientId}
        onSelect={(v) => {
          updateField('clientId', v);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
        emptyMessage="No clients yet. Add a client first."
      />
      <OptionPickerModal
        visible={activePicker === 'type'}
        title="Assessment Type"
        options={typeOptions}
        selectedValue={form.assessmentType}
        onSelect={(v) => {
          updateField('assessmentType', v as AssessmentInput['assessmentType']);
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
          updateField('status', v as AssessmentInput['status']);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
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
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateFieldWrapper: {
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
