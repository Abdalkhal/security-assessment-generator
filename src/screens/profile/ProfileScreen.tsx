import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { LoadingView } from '../../components/LoadingView';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { colors, radius, spacing, typography } from '../../theme';
import { DashboardStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setName(profile.name ?? '');
          setCompany(profile.company ?? '');
          setPhone(profile.phone ?? '');
          setWebsite(profile.website ?? '');
        } else {
          setName(user.displayName ?? '');
        }
      } catch {
        setError('Unable to load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: name.trim(), company: company.trim(), phone: phone.trim(), website: website.trim() });
      setSaved(true);
    } catch {
      setError('Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView message="Loading profile..." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Report Letterhead</Text>
            <Text style={styles.sectionSubtitle}>
              These details are used as the "Prepared By" information on generated reports.
            </Text>
            <TextField label="Name" placeholder="Jane Doe" value={name} onChangeText={setName} />
            <TextField label="Company / Consultant Name" placeholder="Acme Security Consulting" value={company} onChangeText={setCompany} />
            <TextField label="Phone" placeholder="+1 555 123 4567" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextField label="Website" placeholder="https://example.com" autoCapitalize="none" value={website} onChangeText={setWebsite} />

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {saved && <Text style={styles.savedText}>Profile saved.</Text>}

            <PrimaryButton label="Save Changes" onPress={handleSave} loading={saving} />
          </View>

          <SecondaryButton label="Log Out" onPress={() => setLogoutConfirmVisible(true)} style={styles.logoutButton} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log out?"
        message="You will need to sign in again to access your assessments."
        confirmLabel="Log Out"
        destructive
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          logout();
        }}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  savedText: {
    ...typography.body,
    color: colors.success,
    marginBottom: spacing.md,
  },
  logoutButton: {
    width: '100%',
  },
});
