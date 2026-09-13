import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AssessmentsListScreen } from '../screens/assessments/AssessmentsListScreen';
import { colors } from '../theme';
import { AssessmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<AssessmentsStackParamList>();

export function AssessmentsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="AssessmentsList" component={AssessmentsListScreen} />
    </Stack.Navigator>
  );
}
