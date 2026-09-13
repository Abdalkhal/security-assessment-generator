import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AssessmentsStackNavigator } from './AssessmentsStack';
import { ClientsStackNavigator } from './ClientsStack';
import { DashboardStackNavigator } from './DashboardStack';
import { ReportsStackNavigator } from './ReportsStack';
import { colors } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  DashboardTab: 'grid-outline',
  AssessmentsTab: 'shield-outline',
  ClientsTab: 'business-outline',
  ReportsTab: 'document-text-outline',
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNavigator} options={{ title: 'Dashboard' }} />
      <Tab.Screen
        name="AssessmentsTab"
        component={AssessmentsStackNavigator}
        options={{ title: 'Assessments' }}
      />
      <Tab.Screen name="ClientsTab" component={ClientsStackNavigator} options={{ title: 'Clients' }} />
      <Tab.Screen name="ReportsTab" component={ReportsStackNavigator} options={{ title: 'Reports' }} />
    </Tab.Navigator>
  );
}
