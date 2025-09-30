import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components';
import Bank from 'phosphor-react-native/src/icons/Bank';
import Target from 'phosphor-react-native/src/icons/Target';
import ListDashes from 'phosphor-react-native/src/icons/ListDashes';
import ChartPieSlice from 'phosphor-react-native/src/icons/ChartPieSlice';
import DotsThreeOutline from 'phosphor-react-native/src/icons/DotsThreeOutline';

import { useUserConfigs } from '@storage/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

export default function AppLayout() {
  const theme: ThemeProps = useTheme();
  const { darkMode } = useUserConfigs();

  return (
    <>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.statusBar}
      />
      <Tabs
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
            overflow: 'hidden',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
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
          }}
        />
        <Tabs.Screen
          name='accounts'
          options={{
            title: 'Contas',
            tabBarIcon: ({ size, color }) => <Bank size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name='budgets'
          options={{
            title: 'Orçamentos',
            tabBarIcon: ({ size, color }) => (
              <Target size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='overview'
          options={{
            title: 'Resumo',
            tabBarIcon: ({ size, color }) => (
              <ChartPieSlice size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='options'
          options={{
            title: 'Mais',
            tabBarIcon: ({ size, color }) => (
              <DotsThreeOutline size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
