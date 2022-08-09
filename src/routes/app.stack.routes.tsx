import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'

import theme from '@themes/theme';

import { RegisterCategory } from '@screens/RegisterCategory';
import { RegisterAccount } from '@screens/RegisterAccount';
import { OptionsMenu } from '@screens/OptionsMenu';
import { Categories } from '@screens/Categories';
import { AppTabRoutes } from './app.tab.routes';

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
        name="Cadastrar conta"
        component={RegisterAccount}
      />

      <Screen
        name="Cadastrar categoria"
        component={Categories}
      />
    </Navigator>
  )
}