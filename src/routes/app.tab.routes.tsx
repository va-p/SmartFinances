import React from 'react';

import { useTheme } from 'styled-components';
import * as Icon from 'phosphor-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { AppBudgetStackRoutes } from './app.budget.stack.routes';
import { AppOptionsStackRoutes } from './app.options.stack.routes';
import { AppAccountStackRoutes } from './app.account.stack.routes';
import { AppOverviewStackRoutes } from './app.overview.stack.routes';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppTabRoutes() {
  const theme = useTheme();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.primary,
        tabBarItemStyle: {
          backgroundColor: 'transparent',
          overflow: 'hidden',
        },
        tabBarStyle: {
          position: 'absolute',
          height: 56,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: theme.colors.backgroundNav,
          shadowColor: theme.colors.shape,
          borderTopLeftRadius: 75,
          borderTopRightRadius: 75,
          overflow: 'hidden',
        },
      }}
    >
      <Screen
        name='Transações'
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
        component={AppOverviewStackRoutes}
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
