import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { TermsAndPolices } from '@screens/TermsAndPolices';
import { OptionsMenu } from '@screens/OptionsMenu';
import { Categories } from '@screens/Categories';
import { HelpCenter } from '@screens/HelpCenter';
import { Accounts } from '@screens/Accounts';

const { Navigator, Screen } = createStackNavigator();

export function AppStackRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Screen
        name="Menu"
        component={OptionsMenu}
      />

      <Screen
        name="Contas"
        component={Accounts}
      />

      <Screen
        name="Categorias"
        component={Categories}
      />

      <Screen
        name="Central de Ajuda"
        component={HelpCenter}
      />

      <Screen
        name="Termos e Políticas"
        component={TermsAndPolices}
      />
    </Navigator>
  )
}