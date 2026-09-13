import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssessmentCard } from '../../components/AssessmentCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { SearchBar } from '../../components/SearchBar';
import { ASSESSMENT_STATUSES, ASSESSMENT_STATUS_META, AssessmentStatus } from '../../constants/assessment';
import { useAuth } from '../../context/AuthContext';
import { getAssessments } from '../../services/assessmentService';
import { getFindings } from '../../services/findingService';
import { colors, radius, spacing, typography } from '../../theme';
import { Assessment, Finding } from '../../types';
import { getOverallRisk } from '../../utils/risk';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'AssessmentsList'>;

type StatusFilter = AssessmentStatus | 'ALL';

export function AssessmentsListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

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
        setError('Unable to load assessments. Check your connection and try again.');
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

  const findingsByAssessment = useMemo(() => {
    const map = new Map<string, Finding[]>();
    findings.forEach((f) => {
      const list = map.get(f.assessmentId) ?? [];
      list.push(f);
      map.set(f.assessmentId, list);
    });
    return map;
  }, [findings]);

  const filteredAssessments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assessments.filter((a) => {
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchesSearch =
        !term || a.title.toLowerCase().includes(term) || a.clientName.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [assessments, search, statusFilter]);

  const filterChips: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    ...ASSESSMENT_STATUSES.map((s) => ({ label: ASSESSMENT_STATUS_META[s].label, value: s })),
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AssessmentForm', undefined)}
          accessibilityRole="button"
          accessibilityLabel="New assessment"
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {assessments.length > 0 && (
        <>
          <View style={styles.searchWrapper}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search assessments" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {filterChips.map((chip) => {
              const active = statusFilter === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setStatusFilter(chip.value)}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => load()} />
      ) : filteredAssessments.length === 0 ? (
        assessments.length === 0 ? (
          <EmptyState
            icon="shield-outline"
            title="No assessments yet"
            description="Create a client first, then start a new security assessment."
            actionLabel="New Assessment"
            onAction={() => navigation.navigate('AssessmentForm', undefined)}
          />
        ) : (
          <EmptyState icon="search-outline" title="No matches" description="Try a different search or filter." />
        )
      ) : (
        <FlatList
          data={filteredAssessments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          renderItem={({ item }) => {
            const assessmentFindings = findingsByAssessment.get(item.id) ?? [];
            return (
              <AssessmentCard
                assessment={item}
                findingCount={assessmentFindings.length}
                overallRisk={getOverallRisk(assessmentFindings)}
                onPress={() => navigation.navigate('AssessmentDetail', { assessmentId: item.id })}
              />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  chipsRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: colors.primary,
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
});
