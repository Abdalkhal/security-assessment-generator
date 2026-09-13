import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { SeverityBadge } from '../../components/SeverityBadge';
import { BUILT_IN_FINDING_TEMPLATES } from '../../constants/findingTemplates';
import { FINDING_CATEGORIES, FindingCategory } from '../../constants/findingCategory';
import { colors, radius, spacing, typography } from '../../theme';
import { FindingTemplate } from '../../types';
import { AssessmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssessmentsStackParamList, 'FindingLibrary'>;

export function FindingLibraryScreen({ navigation, route }: Props) {
  const { assessmentId } = route.params;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FindingCategory | 'ALL'>('ALL');

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return BUILT_IN_FINDING_TEMPLATES.filter((t) => {
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesSearch = !term || t.title.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, categoryFilter]);

  const usedCategories = useMemo(() => {
    const set = new Set(BUILT_IN_FINDING_TEMPLATES.map((t) => t.category));
    return FINDING_CATEGORIES.filter((c) => set.has(c));
  }, []);

  const handleSelect = (template: FindingTemplate) => {
    navigation.navigate('FindingForm', { assessmentId, templateId: template.id });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finding Library</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search templates" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, categoryFilter === 'ALL' && styles.chipActive]}
          onPress={() => setCategoryFilter('ALL')}
        >
          <Text style={[styles.chipLabel, categoryFilter === 'ALL' && styles.chipLabelActive]}>All</Text>
        </TouchableOpacity>
        {usedCategories.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <TouchableOpacity key={cat} style={[styles.chip, active && styles.chipActive]} onPress={() => setCategoryFilter(cat)}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredTemplates.length === 0 ? (
        <EmptyState icon="search-outline" title="No matches" description="Try a different search or category." />
      ) : (
        <FlatList
          data={filteredTemplates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <SeverityBadge severity={item.defaultSeverity} />
              </View>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
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
  headerTitle: {
    ...typography.title,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.title,
    flex: 1,
  },
  cardCategory: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
