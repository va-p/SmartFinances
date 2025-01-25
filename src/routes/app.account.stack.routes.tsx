import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { Account } from '@screens/Account';
import { Accounts } from '@screens/Accounts';
import { PremiumBenefits } from '@screens/PremiumBenefits';
import { RegisterAccount } from '@screens/RegisterAccount';
import { ConnectedAccounts } from '@screens/ConnectedAccounts';
import { BankingIntegrationDetails } from '@screens/BankingIntegrationDetails';

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

      <Screen name='Editar Conta' component={RegisterAccount} />

      <Screen name='Contas Conectadas' component={ConnectedAccounts} />

      <Screen
        name='Integração Bancária'
        component={BankingIntegrationDetails}
      />

      <Screen name='Assinatura' component={PremiumBenefits} />
    </Navigator>
  );
}
