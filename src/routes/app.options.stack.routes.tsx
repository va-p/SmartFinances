import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { Tags } from '@screens/Tags';
import { Profile } from '@screens/Profile';
import { Categories } from '@screens/Categories';
import { HelpCenter } from '@screens/HelpCenter';
import { TermsOfUse } from '@screens/TermsOfUse';
import { OptionsMenu } from '@screens/OptionsMenu';
import { AccountsList } from '@screens/AccountsList';
import { PrivacyPolicy } from '@screens/PrivacyPolicy';

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

      <Screen name='Meus Dados' component={Profile} />

      <Screen name='Contas' component={AccountsList} />

      <Screen name='Categorias' component={Categories} />

      <Screen name='Etiquetas' component={Tags} />

      <Screen name='Central de Ajuda' component={HelpCenter} />

      <Screen name='Termos de Uso' component={TermsOfUse} />

      <Screen name='Politica de Privacidade' component={PrivacyPolicy} />
    </Navigator>
  );
}
