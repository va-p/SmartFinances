import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { Budgets } from '@screens/Budgets';
import { RegisterBudget } from '@screens/RegisterBudget';

import { RootParamList } from 'src/@types/navigation';
import { BudgetDetails } from '@screens/BudgetDetails';
import { CurrencyProps } from '@interfaces/currencies';
import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

export function AppBudgetStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen name='Todos os Orçamentos' component={Budgets} />

      <Screen name='Orçamento' component={BudgetDetails} />

      <Screen name='Editar Orçamento' component={RegisterBudget} />
    </Navigator>
  );
}
