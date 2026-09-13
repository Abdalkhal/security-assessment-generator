import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientCard } from '../../components/ClientCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { SearchBar } from '../../components/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { getClients } from '../../services/clientService';
import { colors, spacing, typography } from '../../theme';
import { Client } from '../../types';
import { ClientsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientsList'>;

export function ClientsListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadClients = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const data = await getClients(user.uid);
        setClients(data);
      } catch {
        setError('Unable to load clients. Check your connection and try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (c) =>
        c.companyName.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term) ||
        c.industry.toLowerCase().includes(term)
    );
  }, [clients, search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ClientForm', undefined)}
          accessibilityRole="button"
          accessibilityLabel="Add client"
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {clients.length > 0 && (
        <View style={styles.searchWrapper}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search clients" />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => loadClients()} />
      ) : filteredClients.length === 0 ? (
        clients.length === 0 ? (
          <EmptyState
            icon="business-outline"
            title="No clients yet"
            description="Add your first client to start organizing security assessments."
            actionLabel="Add Client"
            onAction={() => navigation.navigate('ClientForm', undefined)}
          />
        ) : (
          <EmptyState icon="search-outline" title="No matches" description="Try a different search term." />
        )
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => loadClients(true)}
          renderItem={({ item }) => (
            <ClientCard client={item} onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })} />
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
