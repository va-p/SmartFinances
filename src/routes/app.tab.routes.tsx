import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';

import { AppStackRoutes } from './app.stack.routes';
import { Charts } from '@screens/Charts';
import { Home } from '@screens/Home';

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
          height: 50,
          paddingTop: 5,
          paddingBottom: 5
        }
      }}
    >
      <Screen
        name="Timeline"
        component={Home}
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
        name="Resumo"
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