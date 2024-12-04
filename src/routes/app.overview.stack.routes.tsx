import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { Overview } from '@screens/Overview';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

import { RootParamList } from 'src/@types/navigation';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

export function AppOverviewStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen name='Visão Geral' component={Overview} />

      <Screen
        name='Transações Por Categoria'
        component={TransactionsByCategory}
      />
    </Navigator>
  );
}
