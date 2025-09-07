import React from 'react';
import { StyleSheet } from 'react-native';

import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components';
import Bank from 'phosphor-react-native/src/icons/Bank';
import Target from 'phosphor-react-native/src/icons/Target';
import ListDashes from 'phosphor-react-native/src/icons/ListDashes';
import ChartPieSlice from 'phosphor-react-native/src/icons/ChartPieSlice';
import DotsThreeOutline from 'phosphor-react-native/src/icons/DotsThreeOutline';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { AppBudgetStackRoutes } from './app.budget.stack.routes';
import { AppOptionsStackRoutes } from './app.options.stack.routes';
import { AppAccountStackRoutes } from './app.account.stack.routes';
import { AppOverviewStackRoutes } from './app.overview.stack.routes';

import { useUserConfigs } from '@storage/userConfigsStorage';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppTabRoutes() {
  const theme = useTheme();
  const { darkMode } = useUserConfigs();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.primary,
        tabBarStyle: {
          position: 'absolute',
          height: 56,
          paddingTop: 6,
          paddingBottom: 6,
          borderTopLeftRadius: 75,
          borderTopRightRadius: 75,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={darkMode ? 40 : 80}
            experimentalBlurMethod='dimezisBlurView'
            style={{
              ...StyleSheet.absoluteFillObject,
              flex: 1,
              borderTopLeftRadius: 75,
              borderTopRightRadius: 75,
              overflow: 'hidden',
              backgroundColor: 'transparent',
              borderBlockColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              borderTopWidth: 0,
            }}
          />
        ),
      }}
    >
      <Screen
        name='Transações'
        component={Home}
        options={{
          tabBarIcon: ({ size, color }) => (
            <ListDashes size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Contas'
        component={AppAccountStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => <Bank size={size} color={color} />,
        }}
      />

      <Screen
        name='Orçamentos'
        component={AppBudgetStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => <Target size={size} color={color} />,
        }}
      />

      <Screen
        name='Resumo'
        component={AppOverviewStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <ChartPieSlice size={size} color={color} />
          ),
        }}
      />

      <Screen
        name='Mais'
        component={AppOptionsStackRoutes}
        options={{
          tabBarIcon: ({ size, color }) => (
            <DotsThreeOutline size={size} color={color} />
          ),
        }}
      />
    </Navigator>
  );
}
