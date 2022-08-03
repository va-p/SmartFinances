import React from 'react';
import { Platform } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';

import { RegisterTransaction } from '@screens/RegisterTransaction';
import { AppStackRoutes } from './app.stack.routes';
import { Dashboard } from '@screens/Dashboard';
import { Charts } from '@screens/Charts';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppTabRoutes() {
  const theme = useTheme();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          height: 60,
          paddingTop: 10,
          paddingBottom: 10
        }
      }}
    >
      <Screen
        name="Timeline"
        component={Dashboard}
        options={{
          tabBarIcon: (({ size, color }) => (
            <Ionicons
              name='list-outline'
              size={size}
              color={color}
            />
          ))
        }}
      />

      <Screen
        name="Cadastrar"
        component={RegisterTransaction}
        options={{
          tabBarIcon: (({ size, color }) => (
            <Ionicons
              name='add-circle-outline'
              size={size}
              color={color}
            />
          ))
        }}
      />

      <Screen
        name="Gráficos"
        component={Charts}
        options={{
          tabBarIcon: (({ size, color }) => (
            <Ionicons
              name='pie-chart-outline'
              size={size}
              color={color}
            />
          ))
        }}
      />

      <Screen
        name="Mais"
        component={AppStackRoutes}
        options={{
          tabBarIcon: (({ size, color }) => (
            <Ionicons
              name='ellipsis-horizontal-outline'
              size={size}
              color={color}
            />
          ))
        }}
      />
    </Navigator>
  );
}