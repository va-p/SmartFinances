import React from 'react';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dependencies
import { useTheme } from 'styled-components';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ThemeProvider, DarkTheme, DefaultTheme, useSegments } from 'expo-router';

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
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // First two tabs (index, accounts) use statusBar; the rest use gradientEnd
  // so the bar blends with each screen's top section.
  // segments[1] is undefined on the index route — fallback to 'index'.
  const activeTab = (segments as string[])[1] || 'index';
  const statusBarColor = (
    activeTab === 'index' || activeTab === 'accounts'
  ) ? theme.colors.statusBar : theme.colors.gradientEnd;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        translucent
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor='transparent'
      />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: statusBarColor,
          zIndex: 1,
        }}
      />

      <ThemeProvider value={darkMode ? glassDarkTheme : glassDefaultTheme}>
        <NativeTabs
          labelStyle={{
            color: darkMode ? 'white' : 'black',
          }}
          tintColor={theme.colors.primary}
        >
          <NativeTabs.Trigger name='index'>
            <NativeTabs.Trigger.Label>Transações</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              sf={{
                default: 'list.bullet',
                selected: 'list.bullet',
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
                selected: 'ellipsis.circle',
              }}
              md='more_horiz'
            />
          </NativeTabs.Trigger>
        </NativeTabs>
      </ThemeProvider>
    </View>
  );
}
