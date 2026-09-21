import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PasswordField } from '../../components/PasswordField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { getFirebaseAuthErrorMessage, loginWithEmail } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleLogin = async () => {
    setFormError('');
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error('[auth] login failed', err);
      const mapped = getFirebaseAuthErrorMessage(err?.code ?? '');
      const detail = err?.code ? ` (${err.code})` : err?.message ? `: ${err.message}` : '';
      setFormError(`${mapped}${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your assessments</Text>

        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="you@company.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            autoCapitalize="none"
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
          />

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>

          <PrimaryButton label="Sign In" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  link: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
