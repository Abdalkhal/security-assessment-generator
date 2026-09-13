import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ReportsListScreen } from '../screens/reports/ReportsListScreen';
import { colors } from '../theme';
import { ReportsStackParamList } from './types';

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export function ReportsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="ReportsList" component={ReportsListScreen} />
    </Stack.Navigator>
  );
}
