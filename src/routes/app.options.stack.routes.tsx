import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { PrivacyPolicy } from '@screens/PrivacyPolicy';
import { OptionsMenu } from '@screens/OptionsMenu';
import { TermsOfUse } from '@screens/TermsOfUse';
import { Categories } from '@screens/Categories';
import { HelpCenter } from '@screens/HelpCenter';
import { Accounts } from '@screens/Accounts';
import { Tags } from '@screens/Tags';

import theme from '@themes/theme';

const { Navigator, Screen } = createStackNavigator();

export function AppOptionsStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors.background
        }
      }}
    >
      <Screen
        name="Mais Opções"
        component={OptionsMenu}
      />

      <Screen
        name="Categorias"
        component={Categories}
      />

      <Screen
        name="Etiquetas"
        component={Tags}
      />

      <Screen
        name="Central de Ajuda"
        component={HelpCenter}
      />

      <Screen
        name="Termos de Uso"
        component={TermsOfUse}
      />

      <Screen
        name="Politica de Privacidade"
        component={PrivacyPolicy}
      />
    </Navigator>
  )
}