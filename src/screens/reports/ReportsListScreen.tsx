import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { useAuth } from '../../context/AuthContext';
import { generateAssessmentReportPdf } from '../../services/pdfService';
import { getReports } from '../../services/reportService';
import { colors, radius, spacing, typography } from '../../theme';
import { ReportRecord } from '../../types';

export function ReportsListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyReportId, setBusyReportId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getReports(user.uid);
      setReports(data);
    } catch {
      setError('Unable to load reports. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleShareAgain = async (report: ReportRecord) => {
    if (!user) return;
    setActionError('');
    setBusyReportId(report.id);
    try {
      await generateAssessmentReportPdf(user.uid, report.assessmentId);
      await load();
    } catch {
      setActionError('Unable to generate the PDF. Please try again.');
    } finally {
      setBusyReportId(null);
    }
  };

  const handleView = (report: ReportRecord) => {
    navigation.navigate('AssessmentsTab', {
      screen: 'ReportPreview',
      params: { assessmentId: report.assessmentId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      {!!actionError && <Text style={styles.actionErrorText}>{actionError}</Text>}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No reports yet"
          description="Generate a report from a completed assessment to see it here."
        />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const busy = busyReportId === item.id;
            const generatedDate = new Date(item.generatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            return (
              <View style={styles.card}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {item.assessmentTitle}
                </Text>
                <Text style={styles.reportMeta} numberOfLines={1}>
                  {item.clientName} - {generatedDate}
                </Text>
                <Text style={styles.reportRisk}>Overall Risk: {item.overallRisk}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleView(item)}>
                    <Ionicons name="eye-outline" size={16} color={colors.text} />
                    <Text style={styles.actionLabel}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareAgain(item)}
                    disabled={busy}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="share-social-outline" size={16} color={colors.text} />
                        <Text style={styles.actionLabel}>Share</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareAgain(item)}
                    disabled={busy}
                  >
                    <Ionicons name="refresh-outline" size={16} color={colors.text} />
                    <Text style={styles.actionLabel}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
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
  actionErrorText: {
    ...typography.body,
    color: colors.danger,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reportTitle: {
    ...typography.title,
  },
  reportMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  reportRisk: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
});
