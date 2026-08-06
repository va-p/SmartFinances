import React from 'react';
import { StatusBar, View } from 'react-native';

// Dependencies
import { useTheme } from 'styled-components';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';

import { useUserConfigs } from '@stores/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

// Custom themes with transparent backgrounds so Liquid Glass can
// sample the screen content behind the tab bar.
const glassDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

const glassDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

export default function AppLayout() {
  const theme = useTheme() as ThemeProps;
  const { darkMode } = useUserConfigs();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.statusBar }}>
      <StatusBar
        translucent
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor='transparent'
      />

      <ThemeProvider value={darkMode ? glassDarkTheme : glassDefaultTheme}>
        <NativeTabs
          labelStyle={{
            color: theme.colors.text,
          }}
          tintColor={theme.colors.primary}
        >
          <NativeTabs.Trigger name='index'>
            <NativeTabs.Trigger.Label>Transações</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{
                default: 'list.bullet',
                selected: 'list.bullet.circle.fill',
              }}
              md={{ default: 'list', selected: 'list_alt' }}
            />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name='accounts'>
            <NativeTabs.Trigger.Label>Contas</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{
                default: 'building.columns',
                selected: 'building.columns.fill',
              }}
              md='account_balance'
            />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name='budgets'>
            <NativeTabs.Trigger.Label>Orçamentos</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: 'target', selected: 'target' }}
              md='gps_fixed'
            />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name='overview'>
            <NativeTabs.Trigger.Label>Resumo</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
              md='pie_chart'
            />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name='options'>
            <NativeTabs.Trigger.Label>Mais</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{
                default: 'ellipsis.circle',
                selected: 'ellipsis.circle.fill',
              }}
              md='more_horiz'
            />
          </NativeTabs.Trigger>
        </NativeTabs>
      </ThemeProvider>
    </View>
  );
}
