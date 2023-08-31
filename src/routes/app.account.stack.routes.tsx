import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { RegisterAccount } from '@screens/RegisterAccount';
import { Accounts } from '@screens/Accounts';
import { Account } from '@screens/Account';

import { RootParamList } from 'src/@types/navigation';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

export function AppAccountStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen name='Todas as Contas' component={Accounts} />

      <Screen name='Conta' component={Account} />

      <Screen
        name='Editar Conta'
        component={RegisterAccount}
        initialParams={{
          id: '',
        }}
      />
    </Navigator>
  );
}
