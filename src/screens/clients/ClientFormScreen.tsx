import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingView } from '../../components/LoadingView';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { createClient, getClient, updateClient } from '../../services/clientService';
import { colors, spacing, typography } from '../../theme';
import { ClientInput } from '../../types';
import { ClientsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientForm'>;

const EMPTY_FORM: ClientInput = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  industry: '',
  notes: '',
};

export function ClientFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const clientId = route.params?.clientId;
  const isEditing = !!clientId;

  const [form, setForm] = useState<ClientInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      try {
        const client = await getClient(clientId);
        if (client) {
          setForm({
            companyName: client.companyName,
            contactPerson: client.contactPerson,
            email: client.email,
            phone: client.phone,
            industry: client.industry,
            notes: client.notes,
          });
        }
      } catch {
        setError('Unable to load client details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  const updateField = (field: keyof ClientInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (isEditing && clientId) {
        await updateClient(clientId, form);
      } else {
        await createClient(user.uid, form);
      }
      navigation.goBack();
    } catch {
      setError('Unable to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView message="Loading client..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Client' : 'New Client'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextField
            label="Company Name *"
            placeholder="Acme Corporation"
            value={form.companyName}
            onChangeText={(v) => updateField('companyName', v)}
          />
          <TextField
            label="Contact Person"
            placeholder="Jane Doe"
            value={form.contactPerson}
            onChangeText={(v) => updateField('contactPerson', v)}
          />
          <TextField
            label="Email"
            placeholder="contact@acme.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
          />
          <TextField
            label="Phone"
            placeholder="+1 555 123 4567"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
          />
          <TextField
            label="Industry"
            placeholder="Financial Services"
            value={form.industry}
            onChangeText={(v) => updateField('industry', v)}
          />
          <TextField
            label="Notes"
            placeholder="Additional context about this client"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton label={isEditing ? 'Save Changes' : 'Create Client'} onPress={handleSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  notesInput: {
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
