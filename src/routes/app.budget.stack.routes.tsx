import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { RegisterBudget } from '@screens/RegisterBudget';
import { Budgets } from '@screens/Budgets';
import { Account } from '@screens/Account';

import { RootParamList } from 'src/@types/navigation';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

export function AppBudgetStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen name='Todos os Orçamentos' component={Budgets} />

      <Screen name='Orçamento' component={Account} />

      <Screen
        name='Editar Orçamento'
        component={RegisterBudget}
        initialParams={{
          id: '',
        }}
      />
    </Navigator>
  );
}
