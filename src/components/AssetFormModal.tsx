import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ASSET_ENVIRONMENTS, ASSET_TYPES, AssetEnvironment, AssetType } from '../constants/asset';
import { colors, radius, spacing, typography } from '../theme';
import { Asset, AssetInput } from '../types';
import { OptionPickerModal, PickerOption } from './OptionPickerModal';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { SelectInput } from './SelectInput';
import { TextField } from './TextField';

interface AssetFormModalProps {
  visible: boolean;
  initialAsset?: Asset | null;
  saving: boolean;
  onSave: (input: AssetInput) => void;
  onClose: () => void;
}

const EMPTY: AssetInput = {
  name: '',
  type: 'Web Application',
  location: '',
  environment: 'Production',
  description: '',
};

export function AssetFormModal({ visible, initialAsset, saving, onSave, onClose }: AssetFormModalProps) {
  const [form, setForm] = useState<AssetInput>(EMPTY);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState<'type' | 'environment' | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(
        initialAsset
          ? {
              name: initialAsset.name,
              type: initialAsset.type,
              location: initialAsset.location,
              environment: initialAsset.environment,
              description: initialAsset.description,
            }
          : EMPTY
      );
      setError('');
    }
  }, [visible, initialAsset]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Please enter a name for this asset.');
      return;
    }
    onSave(form);
  };

  const typeOptions: PickerOption[] = ASSET_TYPES.map((t) => ({ label: t, value: t }));
  const environmentOptions: PickerOption[] = ASSET_ENVIRONMENTS.map((e) => ({ label: e, value: e }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{initialAsset ? 'Edit Asset' : 'Add Asset'}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <TextField
              label="Name *"
              placeholder="Customer Portal"
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <SelectInput label="Type" value={form.type} onPress={() => setActivePicker('type')} />
            <SelectInput label="Environment" value={form.environment} onPress={() => setActivePicker('environment')} />
            <TextField
              label="URL / IP"
              placeholder="https://app.example.com or 10.0.0.5"
              autoCapitalize="none"
              value={form.location}
              onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
            />
            <TextField
              label="Description"
              placeholder="Optional context"
              value={form.description}
              onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
              multiline
              numberOfLines={3}
              style={styles.descriptionInput}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.actions}>
              <SecondaryButton label="Cancel" onPress={onClose} style={styles.actionButton} />
              <PrimaryButton label="Save" onPress={handleSave} loading={saving} style={styles.actionButton} />
            </View>
          </ScrollView>
        </View>
      </View>

      <OptionPickerModal
        visible={activePicker === 'type'}
        title="Asset Type"
        options={typeOptions}
        selectedValue={form.type}
        onSelect={(v) => {
          setForm((p) => ({ ...p, type: v as AssetType }));
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
      <OptionPickerModal
        visible={activePicker === 'environment'}
        title="Environment"
        options={environmentOptions}
        selectedValue={form.environment}
        onSelect={(v) => {
          setForm((p) => ({ ...p, environment: v as AssetEnvironment }));
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
