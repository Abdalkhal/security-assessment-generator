import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ClientDetailScreen } from '../screens/clients/ClientDetailScreen';
import { ClientFormScreen } from '../screens/clients/ClientFormScreen';
import { ClientsListScreen } from '../screens/clients/ClientsListScreen';
import { colors } from '../theme';
import { ClientsStackParamList } from './types';

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="ClientsList" component={ClientsListScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} />
    </Stack.Navigator>
  );
}
