import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SCOPE_ITEM_TYPES, SCOPE_SIDES, ScopeItemType, ScopeSide } from '../constants/scope';
import { colors, radius, spacing, typography } from '../theme';
import { ScopeItem, ScopeItemInput } from '../types';
import { OptionPickerModal, PickerOption } from './OptionPickerModal';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { SelectInput } from './SelectInput';
import { TextField } from './TextField';

interface ScopeFormModalProps {
  visible: boolean;
  initialItem?: ScopeItem | null;
  saving: boolean;
  onSave: (input: ScopeItemInput) => void;
  onClose: () => void;
}

const SIDE_LABELS: Record<ScopeSide, string> = { IN_SCOPE: 'In Scope', OUT_OF_SCOPE: 'Out of Scope' };

const EMPTY: ScopeItemInput = { side: 'IN_SCOPE', type: 'Domain', value: '', notes: '' };

export function ScopeFormModal({ visible, initialItem, saving, onSave, onClose }: ScopeFormModalProps) {
  const [form, setForm] = useState<ScopeItemInput>(EMPTY);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState<'side' | 'type' | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(
        initialItem
          ? { side: initialItem.side, type: initialItem.type, value: initialItem.value, notes: initialItem.notes ?? '' }
          : EMPTY
      );
      setError('');
    }
  }, [visible, initialItem]);

  const handleSave = () => {
    if (!form.value.trim()) {
      setError('Please enter a value (domain, IP, URL, etc).');
      return;
    }
    onSave(form);
  };

  const sideOptions: PickerOption[] = SCOPE_SIDES.map((s) => ({ label: SIDE_LABELS[s], value: s }));
  const typeOptions: PickerOption[] = SCOPE_ITEM_TYPES.map((t) => ({ label: t, value: t }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{initialItem ? 'Edit Scope Item' : 'Add Scope Item'}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <SelectInput label="Side" value={SIDE_LABELS[form.side]} onPress={() => setActivePicker('side')} />
            <SelectInput label="Type" value={form.type} onPress={() => setActivePicker('type')} />
            <TextField
              label="Value *"
              placeholder="example.com, 10.0.0.0/24, https://app.example.com"
              autoCapitalize="none"
              value={form.value}
              onChangeText={(v) => setForm((p) => ({ ...p, value: v }))}
            />
            <TextField
              label="Notes"
              placeholder="Optional context"
              value={form.notes}
              onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
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
        visible={activePicker === 'side'}
        title="Side"
        options={sideOptions}
        selectedValue={form.side}
        onSelect={(v) => {
          setForm((p) => ({ ...p, side: v as ScopeSide }));
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
      <OptionPickerModal
        visible={activePicker === 'type'}
        title="Type"
        options={typeOptions}
        selectedValue={form.type}
        onSelect={(v) => {
          setForm((p) => ({ ...p, type: v as ScopeItemType }));
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
  notesInput: {
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
