import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AssessmentDetailScreen } from '../screens/assessments/AssessmentDetailScreen';
import { AssessmentFormScreen } from '../screens/assessments/AssessmentFormScreen';
import { AssessmentsListScreen } from '../screens/assessments/AssessmentsListScreen';
import { FindingDetailScreen } from '../screens/findings/FindingDetailScreen';
import { FindingFormScreen } from '../screens/findings/FindingFormScreen';
import { FindingLibraryScreen } from '../screens/findings/FindingLibraryScreen';
import { colors } from '../theme';
import { AssessmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<AssessmentsStackParamList>();

export function AssessmentsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="AssessmentsList" component={AssessmentsListScreen} />
      <Stack.Screen name="AssessmentDetail" component={AssessmentDetailScreen} />
      <Stack.Screen name="AssessmentForm" component={AssessmentFormScreen} />
      <Stack.Screen name="FindingLibrary" component={FindingLibraryScreen} />
      <Stack.Screen name="FindingForm" component={FindingFormScreen} />
      <Stack.Screen name="FindingDetail" component={FindingDetailScreen} />
    </Stack.Navigator>
  );
}
