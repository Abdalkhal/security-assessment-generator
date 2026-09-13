import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { ConfigRequiredScreen } from '../screens/setup/ConfigRequiredScreen';
import { colors } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

export function RootNavigator() {
  const { user, initializing, isFirebaseConfigured } = useAuth();

  if (!isFirebaseConfigured) {
    return <ConfigRequiredScreen />;
  }

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
