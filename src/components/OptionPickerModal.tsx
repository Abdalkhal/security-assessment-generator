import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface PickerOption {
  label: string;
  value: string;
  description?: string;
}

interface OptionPickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  emptyMessage?: string;
}

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  emptyMessage = 'No options available.',
}: OptionPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {options.length === 0 ? (
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => onSelect(item.value)}
                  >
                    <View style={styles.optionTextWrapper}>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                      {!!item.description && <Text style={styles.optionDescription}>{item.description}</Text>}
                    </View>
                    {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
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
    maxHeight: '75%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryMuted,
  },
  optionTextWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  optionLabel: {
    ...typography.body,
  },
  optionDescription: {
    ...typography.caption,
    marginTop: 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.xl,
    textAlign: 'center',
  },
});
