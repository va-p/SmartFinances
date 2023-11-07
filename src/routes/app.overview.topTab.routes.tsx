import React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Header } from '@components/Header';

import { OverviewExpenses } from '@screens/OverviewExpenses';
import { OverviewRevenues } from '@screens/OverviewRevenues';

import theme from '@themes/theme';

const { Navigator, Screen } = createMaterialTopTabNavigator();

export function AppOverviewTopTabRoutes() {
  return (
    <>
      <Header type='secondary' title='Resumo' />

      <Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.medium,
            color: theme.colors.text,
          },
          tabBarActiveTintColor: theme.colors.text_light,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
            opacity: 1,
          },
        }}
      >
        <Screen
          name='Visão Geral das Despesas'
          component={OverviewExpenses}
          options={{ title: 'Despesas' }}
        />

        <Screen
          name='Visão Geral das Receitas'
          component={OverviewRevenues}
          options={{ title: 'Receitas' }}
        />
      </Navigator>
    </>
  );
}
