import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { RegisterAccount } from '@screens/RegisterAccount';
import { Accounts } from '@screens/Accounts';
import { Account } from '@screens/Account';

const { Navigator, Screen } = createStackNavigator();

export function AppAccountStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Screen
        name="Todas as Contas"
        component={Accounts}
      />

      <Screen
        name="Conta"
        component={Account}
      />

      <Screen
        name="Editar Conta"
        component={RegisterAccount}
      />
    </Navigator>
  )
}