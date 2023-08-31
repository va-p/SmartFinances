import React, { useEffect } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Header } from '@components/Header';

import { TransactionsByCategory } from '@screens/TransactionsByCategory';
import { OverviewExpenses } from '@screens/OverviewExpenses';
import { OverviewRevenues } from '@screens/OverviewRevenues';

import theme from '@themes/theme';

const { Navigator, Screen } = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

let routeName: string | undefined = 'Resumo';

// Stack Expenses navigation
function StackExpensesRoutes({ route, navigation }: any) {
  routeName = getFocusedRouteNameFromRoute(route);
  useEffect(() => {
    if (routeName === 'Transações Por Categoria') {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [routeName]);

  return (
    <>
      {routeName === 'Transações Por Categoria' && (
        <Header type='primary' title='Transações Por Categoria' />
      )}
      <Stack.Navigator
        initialRouteName='Visão Geral das Despesas'
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Screen name='Despesas' component={OverviewExpenses} />

        <Screen
          name='Transações Por Categoria'
          component={TransactionsByCategory}
        />
      </Stack.Navigator>
    </>
  );
}

// Stack Revenues navigation
function StackRevenuesRoutes({ route, navigation }: any) {
  routeName = getFocusedRouteNameFromRoute(route);
  useEffect(() => {
    if (routeName === 'Transações Por Categoria') {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [routeName]);

  return (
    <>
      {routeName === 'Transações Por Categoria' && (
        <Header type='primary' title='Transações Por Categoria' />
      )}

      <Stack.Navigator
        initialRouteName='Visão Geral das Receitas'
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Screen name='Receitas' component={OverviewRevenues} />

        <Screen
          name='Transações Por Categoria'
          component={TransactionsByCategory}
        />
      </Stack.Navigator>
    </>
  );
}

// TopTab Overview navigation
export function AppOverviewTopTabRoutes({ route }: any) {
  routeName = getFocusedRouteNameFromRoute(route);

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
          component={StackExpensesRoutes}
          options={{ title: 'Despesas' }}
        />

        <Screen
          name='Visão Geral das Receitas'
          component={StackRevenuesRoutes}
          options={{ title: 'Receitas' }}
        />
      </Navigator>
    </>
  );
}
