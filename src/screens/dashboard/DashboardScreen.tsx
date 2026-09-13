import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssessmentCard } from '../../components/AssessmentCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { FindingCard } from '../../components/FindingCard';
import { LoadingView } from '../../components/LoadingView';
import { StatCard } from '../../components/StatCard';
import { SEVERITY_LEVELS, SEVERITY_META } from '../../constants/severity';
import { useAuth } from '../../context/AuthContext';
import { getAssessments } from '../../services/assessmentService';
import { getFindings } from '../../services/findingService';
import { logout } from '../../services/authService';
import { colors, radius, spacing, typography } from '../../theme';
import { Assessment, Finding } from '../../types';
import { countBySeverity, getOverallRisk } from '../../utils/risk';
import { MainTabParamList } from '../../navigation/types';

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const [assessmentData, findingData] = await Promise.all([
          getAssessments(user.uid),
          getFindings(user.uid),
        ]);
        setAssessments(assessmentData);
        setFindings(findingData);
      } catch {
        setError('Unable to load your dashboard. Check your connection and try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = useMemo(() => {
    const active = assessments.filter((a) => a.status === 'IN_PROGRESS').length;
    const completed = assessments.filter((a) => a.status === 'COMPLETED').length;
    return {
      total: assessments.length,
      active,
      completed,
      totalFindings: findings.length,
    };
  }, [assessments]);

  const severityCounts = useMemo(() => countBySeverity(findings), [findings]);

  const findingsByAssessment = useMemo(() => {
    const map = new Map<string, Finding[]>();
    findings.forEach((f) => {
      const list = map.get(f.assessmentId) ?? [];
      list.push(f);
      map.set(f.assessmentId, list);
    });
    return map;
  }, [findings]);

  const recentAssessments = assessments.slice(0, 3);
  const recentFindings = findings.slice(0, 3);

  const hasAnyData = assessments.length > 0 || findings.length > 0;

  if (loading) return <LoadingView message="Loading your dashboard..." />;
  if (error) return <ErrorView message={error} onRetry={() => load()} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.name}>{user?.displayName || user?.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() => logout()}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!hasAnyData ? (
          <EmptyState
            icon="grid-outline"
            title="Nothing here yet"
            description="Add a client and start your first assessment to see your stats here."
            actionLabel="Add a Client"
            onAction={() => navigation.navigate('ClientsTab')}
          />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Total Assessments" value={stats.total} icon="shield-outline" />
              <StatCard label="Active" value={stats.active} icon="time-outline" accentColor={colors.warning} />
              <StatCard
                label="Completed"
                value={stats.completed}
                icon="checkmark-circle-outline"
                accentColor={colors.success}
              />
              <StatCard label="Total Findings" value={stats.totalFindings} icon="bug-outline" accentColor={colors.danger} />
            </View>

            <Text style={styles.sectionTitle}>Risk Overview</Text>
            <View style={styles.riskCard}>
              {SEVERITY_LEVELS.map((level) => {
                const meta = SEVERITY_META[level];
                return (
                  <View key={level} style={styles.riskRow}>
                    <View style={styles.riskLabelRow}>
                      <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                      <Text style={styles.riskLabel}>{meta.label}</Text>
                    </View>
                    <Text style={[styles.riskValue, { color: meta.color }]}>{severityCounts[level]}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Assessments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AssessmentsTab')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentAssessments.length === 0 ? (
              <Text style={styles.emptySectionText}>No assessments yet.</Text>
            ) : (
              recentAssessments.map((a) => {
                const assessmentFindings = findingsByAssessment.get(a.id) ?? [];
                return (
                  <AssessmentCard
                    key={a.id}
                    assessment={a}
                    findingCount={assessmentFindings.length}
                    overallRisk={getOverallRisk(assessmentFindings)}
                  />
                );
              })
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Findings</Text>
            </View>
            {recentFindings.length === 0 ? (
              <Text style={styles.emptySectionText}>No findings recorded yet.</Text>
            ) : (
              recentFindings.map((f) => <FindingCard key={f.id} finding={f} />)
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.caption,
  },
  name: {
    ...typography.h2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  riskCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  riskLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  riskLabel: {
    ...typography.body,
  },
  riskValue: {
    ...typography.bodyStrong,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  emptySectionText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
