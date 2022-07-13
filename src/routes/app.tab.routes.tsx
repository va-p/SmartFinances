import React from 'react';
import { Platform } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';

import { RegisterTransaction } from '@screens/RegisterTransaction';
import { Dashboard } from '@screens/Dashboard';
import { Resume } from '@screens/Resume';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppTabRoutes(){
  const theme = useTheme();

  return(
    <Navigator
      tabBarOptions={{
        activeTintColor: theme.colors.secondary,
        inactiveTintColor: theme.colors.text,
        labelPosition: 'beside-icon',
        style: {
          paddingVertical: Platform.OS === 'ios' ? 20 : 0,
          height: 70
        }
      }}
    >
      <Screen
        name="Transações"
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
        name="Resumo"
        component={Resume}
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
    </Navigator>
  );
}