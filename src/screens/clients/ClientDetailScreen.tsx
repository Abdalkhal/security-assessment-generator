import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorView } from '../../components/ErrorView';
import { LoadingView } from '../../components/LoadingView';
import { useAuth } from '../../context/AuthContext';
import { deleteClient, getClient } from '../../services/clientService';
import { getAssessmentsForClient } from '../../services/assessmentService';
import { colors, radius, spacing, typography } from '../../theme';
import { Assessment, Client } from '../../types';
import { ClientsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientDetail'>;

export function ClientDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { clientId } = route.params;

  const [client, setClient] = useState<Client | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [clientData, assessmentData] = await Promise.all([
        getClient(clientId),
        getAssessmentsForClient(user.uid, clientId),
      ]);
      setClient(clientData);
      setAssessments(assessmentData);
    } catch {
      setError('Unable to load client details.');
    } finally {
      setLoading(false);
    }
  }, [clientId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClient(clientId);
      setConfirmVisible(false);
      navigation.goBack();
    } catch {
      setError('Unable to delete client. Please try again.');
      setConfirmVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingView message="Loading client..." />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!client) return <ErrorView message="Client not found." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ClientForm', { clientId })}
            accessibilityRole="button"
            accessibilityLabel="Edit client"
            style={styles.headerActionButton}
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete client"
            style={styles.headerActionButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="business" size={28} color={colors.primary} />
        </View>
        <Text style={styles.name}>{client.companyName}</Text>
        {!!client.industry && <Text style={styles.industry}>{client.industry}</Text>}

        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Contact" value={client.contactPerson || 'Not provided'} />
          <InfoRow icon="mail-outline" label="Email" value={client.email || 'Not provided'} />
          <InfoRow icon="call-outline" label="Phone" value={client.phone || 'Not provided'} />
        </View>

        {!!client.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{client.notes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Assessments</Text>
            <Text style={styles.assessmentCount}>{assessments.length}</Text>
          </View>
          {assessments.length === 0 ? (
            <Text style={styles.emptyAssessments}>No assessments yet for this client.</Text>
          ) : (
            assessments.slice(0, 5).map((a) => (
              <View key={a.id} style={styles.assessmentRow}>
                <Text style={styles.assessmentTitle} numberOfLines={1}>
                  {a.title}
                </Text>
                <Text style={styles.assessmentMeta}>{a.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete client?"
        message={`This will permanently delete ${client.companyName}. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.infoIcon} />
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerActionButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h2,
    textAlign: 'center',
  },
  industry: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
  },
  infoValue: {
    ...typography.body,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.title,
  },
  notes: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  assessmentCount: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  emptyAssessments: {
    ...typography.body,
    color: colors.textSecondary,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  assessmentTitle: {
    ...typography.body,
    flex: 1,
    marginRight: spacing.sm,
  },
  assessmentMeta: {
    ...typography.caption,
  },
});
