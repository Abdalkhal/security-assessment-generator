import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing, typography } from '../../theme';

export function ReportsListScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>
      <EmptyState
        icon="document-text-outline"
        title="No reports yet"
        description="Generate a report from a completed assessment to see it here."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
  },
});
