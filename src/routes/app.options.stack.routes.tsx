import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { Tags } from '@screens/Tags';
import { Profile } from '@screens/Profile';
import { Categories } from '@screens/Categories';
import { OptionsMenu } from '@screens/OptionsMenu';
import { AccountsList } from '@screens/AccountsList';
import { PremiumBenefits } from '@screens/PremiumBenefits';
import { ConnectedAccounts } from '@screens/ConnectedAccounts';

import theme from '@themes/theme';

const { Navigator, Screen } = createStackNavigator();

export function AppOptionsStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Screen name='Mais Opções' component={OptionsMenu} />

      <Screen name='Perfil' component={Profile} />

      <Screen name='Assinatura' component={PremiumBenefits} />

      <Screen name='Contas' component={AccountsList} />

      <Screen name='Contas Conectadas' component={ConnectedAccounts} />

      <Screen name='Categorias' component={Categories} />

      <Screen name='Etiquetas' component={Tags} />
    </Navigator>
  );
}
