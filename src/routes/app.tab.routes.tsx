import React from 'react';

import { useTheme } from 'styled-components';
import * as Icon from 'phosphor-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { AppBudgetStackRoutes } from './app.budget.stack.routes';
import { AppOptionsStackRoutes } from './app.options.stack.routes';
import { AppAccountStackRoutes } from './app.account.stack.routes';
import { AppOverviewTopTabRoutes } from './app.overview.topTab.routes';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppTabRoutes() {
  const theme = useTheme();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: theme.colors.background,
        tabBarInactiveBackgroundColor: theme.colors.background,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          height: 50,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Screen
        name='Timeline'
        component={Home}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon.ListDashes size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Contas'
        component={AppAccountStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon.Bank size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Orçamentos'
        component={AppBudgetStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon.Target size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Resumo'
        component={AppOverviewTopTabRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon.ChartPieSlice size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Mais'
        component={AppOptionsStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Icon.DotsThreeOutline size={size} color={color} />
          ),
        }}
      />
    </Navigator>
  );
}
