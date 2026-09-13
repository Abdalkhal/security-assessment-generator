import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
}

function toDate(value: string): Date {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const date = toDate(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, !!error && styles.inputError]}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
      >
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatDisplay(value) : 'Select date'}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setShowPicker(false);
              return;
            }
            if (selectedDate) {
              onChange(selectedDate.toISOString().slice(0, 10));
            }
            if (Platform.OS !== 'ios') {
              setShowPicker(false);
            }
          }}
        />
      )}
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
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
