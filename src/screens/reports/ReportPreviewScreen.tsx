import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SeverityBadge } from '../../components/SeverityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { ASSESSMENT_STATUS_META } from '../../constants/assessment';
import { SEVERITY_LEVELS, SEVERITY_META } from '../../constants/severity';
import { FINDING_STATUS_META } from '../../constants/findingStatus';
import { useAuth } from '../../context/AuthContext';
import { getAssessment } from '../../services/assessmentService';
import { getFindingsForAssessment } from '../../services/findingService';
import { generateAssessmentReportPdf } from '../../services/pdfService';
import { getScopeItems } from '../../services/scopeService';
import { colors, radius, spacing, typography } from '../../theme';
import { Assessment, Finding, ScopeItem } from '../../types';
import { countBySeverity, getOverallRisk } from '../../utils/risk';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'ReportPreview'>;

export function ReportPreviewScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { assessmentId } = route.params;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [assessmentData, findingData, scopeData] = await Promise.all([
        getAssessment(assessmentId),
        getFindingsForAssessment(user.uid, assessmentId),
        getScopeItems(user.uid, assessmentId),
      ]);
      setAssessment(assessmentData);
      setFindings(findingData);
      setScopeItems(scopeData);
    } catch {
      setError('Unable to load report data.');
    } finally {
      setLoading(false);
    }
  }, [assessmentId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleGeneratePdf = async () => {
    if (!user) return;
    setGenerateError('');
    setGenerating(true);
    try {
      await generateAssessmentReportPdf(user.uid, assessmentId);
    } catch {
      setGenerateError('Unable to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const severityCounts = useMemo(() => countBySeverity(findings), [findings]);
  const overallRisk = useMemo(() => getOverallRisk(findings), [findings]);
  const importantFindings = findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
  const inScopeItems = scopeItems.filter((s) => s.side === 'IN_SCOPE');
  const outScopeItems = scopeItems.filter((s) => s.side === 'OUT_OF_SCOPE');

  if (loading) return <LoadingView message="Preparing report preview..." />;
  if (error && !assessment) return <ErrorView message={error} onRetry={load} />;
  if (!assessment) return <ErrorView message="Assessment not found." />;

  const statusMeta = ASSESSMENT_STATUS_META[assessment.status];
  const preparedBy = user?.displayName || user?.email || 'Not set';
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Preview</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel text="COVER" />
        <View style={styles.card}>
          <Text style={styles.reportTitle}>SECURITY ASSESSMENT REPORT</Text>
          <View style={styles.divider} />
          <InfoRow label="Client" value={assessment.clientName} />
          <InfoRow label="Assessment" value={assessment.title} />
          <InfoRow label="Prepared By" value={preparedBy} />
          <InfoRow label="Date" value={today} />
        </View>

        <SectionLabel text="EXECUTIVE SUMMARY" />
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Objective</Text>
          <Text style={styles.bodyText}>{assessment.description || 'Not provided.'}</Text>

          <Text style={[styles.fieldLabel, styles.spacedTop]}>Overall Risk</Text>
          {overallRisk ? <SeverityBadge severity={overallRisk} /> : <Text style={styles.bodyText}>No findings recorded.</Text>}

          <Text style={[styles.fieldLabel, styles.spacedTop]}>Finding Statistics</Text>
          <View style={styles.statsRow}>
            {SEVERITY_LEVELS.map((level) => (
              <View key={level} style={styles.statChip}>
                <Text style={[styles.statValue, { color: SEVERITY_META[level].color }]}>{severityCounts[level]}</Text>
                <Text style={styles.statLabel}>{SEVERITY_META[level].label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.fieldLabel, styles.spacedTop]}>Important Risks</Text>
          {importantFindings.length === 0 ? (
            <Text style={styles.bodyText}>No critical or high severity findings.</Text>
          ) : (
            importantFindings.map((f) => (
              <Text key={f.id} style={styles.bulletText}>
                - {f.displayId}: {f.title}
              </Text>
            ))
          )}
        </View>

        <SectionLabel text="SCOPE" />
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>In Scope</Text>
          {inScopeItems.length === 0 ? (
            <Text style={styles.bodyText}>None recorded.</Text>
          ) : (
            inScopeItems.map((s) => (
              <Text key={s.id} style={styles.bulletText}>
                - {s.value} ({s.type})
              </Text>
            ))
          )}
          <Text style={[styles.fieldLabel, styles.spacedTop]}>Out of Scope</Text>
          {outScopeItems.length === 0 ? (
            <Text style={styles.bodyText}>None recorded.</Text>
          ) : (
            outScopeItems.map((s) => (
              <Text key={s.id} style={styles.bulletText}>
                - {s.value} ({s.type})
              </Text>
            ))
          )}
        </View>

        <SectionLabel text="METHODOLOGY" />
        <View style={styles.card}>
          <Text style={styles.bodyText}>{assessment.methodology || 'Not provided.'}</Text>
        </View>

        <SectionLabel text="RISK SUMMARY" />
        <View style={styles.card}>
          {findings.length === 0 ? (
            <Text style={styles.bodyText}>No findings recorded yet.</Text>
          ) : (
            SEVERITY_LEVELS.map((level) => (
              <View key={level} style={styles.riskRow}>
                <Text style={styles.riskLabel}>{SEVERITY_META[level].label}</Text>
                <Text style={[styles.riskValue, { color: SEVERITY_META[level].color }]}>{severityCounts[level]}</Text>
              </View>
            ))
          )}
        </View>

        <SectionLabel text="DETAILED FINDINGS" />
        {findings.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.bodyText}>No findings have been recorded for this assessment yet.</Text>
          </View>
        ) : (
          findings.map((f) => (
            <View key={f.id} style={styles.card}>
              <View style={styles.findingHeaderRow}>
                <Text style={styles.findingId}>{f.displayId}</Text>
                <SeverityBadge severity={f.severity} />
              </View>
              <Text style={styles.findingTitle}>{f.title}</Text>
              <StatusBadge label={FINDING_STATUS_META[f.status].label} color={FINDING_STATUS_META[f.status].color} />
              <Text style={[styles.fieldLabel, styles.spacedTop]}>Description</Text>
              <Text style={styles.bodyText}>{f.description}</Text>
              <Text style={[styles.fieldLabel, styles.spacedTop]}>Impact</Text>
              <Text style={styles.bodyText}>{f.impact}</Text>
              <Text style={[styles.fieldLabel, styles.spacedTop]}>Recommendation</Text>
              <Text style={styles.bodyText}>{f.recommendation}</Text>
            </View>
          ))
        )}

        <SectionLabel text="CONCLUSION" />
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            This assessment identified {findings.length} finding{findings.length === 1 ? '' : 's'}
            {overallRisk ? ` with an overall risk rating of ${SEVERITY_META[overallRisk].label}.` : '.'} Remediation
            should be prioritized according to severity and business impact.
          </Text>
          <Text style={[styles.disclaimer, styles.spacedTop]}>
            This report documents findings from an authorized security assessment. It is provided for the exclusive
            use of the client and should not be relied upon by any third party. Security assessments have inherent
            limitations and cannot guarantee the absence of vulnerabilities beyond what was tested.
          </Text>
        </View>

        {!!generateError && <Text style={styles.generateErrorText}>{generateError}</Text>}
        <View style={styles.actions}>
          <SecondaryButton
            label="Edit Assessment"
            onPress={() => navigation.navigate('AssessmentForm', { assessmentId })}
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Generate PDF"
            onPress={handleGeneratePdf}
            loading={generating}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
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
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
    ...typography.h3,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.caption,
    flexShrink: 0,
  },
  infoValue: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  fieldLabel: {
    ...typography.label,
  },
  spacedTop: {
    marginTop: spacing.md,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  statChip: {
    alignItems: 'center',
    minWidth: 64,
  },
  statValue: {
    ...typography.h3,
  },
  statLabel: {
    ...typography.caption,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  riskLabel: {
    ...typography.body,
  },
  riskValue: {
    ...typography.bodyStrong,
  },
  findingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  findingId: {
    ...typography.label,
    color: colors.primary,
  },
  findingTitle: {
    ...typography.title,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  generateErrorText: {
    ...typography.body,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
