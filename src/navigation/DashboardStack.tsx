import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme';
import { DashboardStackParamList } from './types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
