import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

const STEPS = [
  'Create a free project at console.firebase.google.com',
  'Enable Authentication -> Sign-in method -> Email/Password',
  'Enable Cloud Firestore and Firebase Storage',
  'Copy .env.example to .env in the project root',
  'Fill in the EXPO_PUBLIC_FIREBASE_* values from Project settings -> General -> Your apps',
  'Restart the Expo dev server',
];

export function ConfigRequiredScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.warning} />
      </View>
      <Text style={styles.title}>Firebase setup required</Text>
      <Text style={styles.subtitle}>
        This app needs a Firebase project before authentication, Firestore, or Storage will work.
      </Text>
      <View style={styles.card}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  stepText: {
    ...typography.body,
    flex: 1,
  },
});
