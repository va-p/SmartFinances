import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';

import { AppOverviewTopTabRoutes } from './app.overview.topTab.routes';
import { AppAccountStackRoutes } from './app.account.stack.routes';
import { AppOptionsStackRoutes } from './app.options.stack.routes';
import { AppBudgetStackRoutes } from './app.budget.stack.routes';
import { Home } from '@screens/Home';

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
            <Ionicons name='list-outline' size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Contas'
        component={AppAccountStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name='wallet-outline' size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Orçamentos'
        component={AppBudgetStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name='disc-outline' size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Resumo'
        component={AppOverviewTopTabRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name='pie-chart-outline' size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Mais'
        component={AppOptionsStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons
              name='ellipsis-horizontal-outline'
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Navigator>
  );
}
