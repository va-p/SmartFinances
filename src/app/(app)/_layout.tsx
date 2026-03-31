import React from 'react';
import { StyleSheet, StatusBar, View, Platform } from 'react-native';

// Dependencies
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons
import Bank from 'phosphor-react-native/src/icons/Bank';
import Target from 'phosphor-react-native/src/icons/Target';
import ListDashes from 'phosphor-react-native/src/icons/ListDashes';
import ChartPieSlice from 'phosphor-react-native/src/icons/ChartPieSlice';
import DotsThreeOutline from 'phosphor-react-native/src/icons/DotsThreeOutline';

import { useUserConfigs } from '@stores/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

export default function AppLayout() {
  const theme = useTheme() as ThemeProps;
  const { darkMode } = useUserConfigs();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.statusBar }}>
      <StatusBar
        translucent
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor='transparent'
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: {
            position: 'absolute',
            height: 56,
            bottom: Platform.OS === 'ios' ? 24 : 16, // Extra lift for iOS home indicator
            marginHorizontal: 20,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderTopWidth: 0,
            borderRadius: 32,
            overflow: 'hidden',
          },
          sceneStyle: {
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <BlurView
              intensity={darkMode ? 30 : 80}
              experimentalBlurMethod='dimezisBlurView'
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Transações',
            tabBarIcon: ({ size, color }) => (
              <ListDashes size={size} color={color} />
            ),
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Tabs.Screen
          name='accounts'
          options={{
            title: 'Contas',
            tabBarIcon: ({ size, color }) => <Bank size={size} color={color} />,
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Tabs.Screen
          name='budgets'
          options={{
            title: 'Orçamentos',
            tabBarIcon: ({ size, color }) => (
              <Target size={size} color={color} />
            ),
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Tabs.Screen
          name='overview'
          options={{
            title: 'Resumo',
            tabBarIcon: ({ size, color }) => (
              <ChartPieSlice size={size} color={color} />
            ),
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
        <Tabs.Screen
          name='options'
          options={{
            title: 'Mais',
            tabBarIcon: ({ size, color }) => (
              <DotsThreeOutline size={size} color={color} />
            ),
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Tabs>

      {insets.bottom > 0 && (
        <View
          style={{
            height: insets.bottom,
            backgroundColor: theme.colors.gradientStart,
          }}
        />
      )}
    </View>
  );
}
