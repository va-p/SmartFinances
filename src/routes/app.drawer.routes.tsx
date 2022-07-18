import React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons'

import { CustomDrawerNavigator } from '@components/CustomDrawerNavigator';

import theme from '@themes/theme';

import { RegisterCategory } from '@screens/RegisterCategory';
import { RegisterAccount } from '@screens/RegisterAccount';
import { AppTabRoutes } from './app.tab.routes';

const { Navigator, Screen } = createDrawerNavigator();

export function AppDrawerRoutes() {
  return (
    <Navigator
      drawerContent={props => <CustomDrawerNavigator {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerTintColor: theme.colors.secondary,
        drawerActiveTintColor: theme.colors.secondary
      }}
    >
      <Screen
        name="Dashboard"
        component={AppTabRoutes}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons
              name='home-outline'
              size={20}
              color={color}
            />
          )
        }}
      />

      <Screen
        name="Cadastrar conta"
        component={RegisterAccount}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons
              name='wallet-outline'
              size={20}
              color={color}
            />
          )
        }}
      />

      <Screen
        name="Cadastrar categoria"
        component={RegisterCategory}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons
              name='pricetags-outline'
              size={20}
              color={color}
            />
          )
        }}
      />
    </Navigator>
  );
}