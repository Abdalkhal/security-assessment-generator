import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface SelectInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onPress: () => void;
}

export function SelectInput({ label, placeholder = 'Select...', value, error, onPress }: SelectInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, !!error && styles.inputError]}
        onPress={onPress}
        accessibilityRole="button"
      >
        <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  value: {
    ...typography.body,
    flex: 1,
    marginRight: spacing.sm,
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
