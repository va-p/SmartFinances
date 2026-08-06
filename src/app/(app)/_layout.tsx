import React from 'react';
import { StyleSheet, StatusBar, View, Platform } from 'react-native';

// Dependencies
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons
import Bank from 'phosphor-react-native/src/icons/Bank';
import Target from 'phosphor-react-native/src/icons/Target';
import ListDashes from 'phosphor-react-native/src/icons/ListDashes';
import ChartPieSlice from 'phosphor-react-native/src/icons/ChartPieSlice';
import DotsThreeOutline from 'phosphor-react-native/src/icons/DotsThreeOutline';

import { useUserConfigs } from '@stores/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

/**
 * Generic tab layout — used on Android and as a fallback for other platforms.
 * iOS overrides this with _layout.ios.tsx (NativeTabs + Liquid Glass).
 */
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
            bottom: Platform.OS === 'ios' ? 24 : 16,
            marginHorizontal: 20,
            backgroundColor: 'transparent',
            // Glass edge: subtle white border for the refraction look
            borderColor: darkMode
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.6)',
            borderWidth: 1,
            borderTopWidth: 1,
            borderRadius: 32,
            overflow: 'hidden',
            // Depth shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 15,
            elevation: 10,
          },
          sceneStyle: {
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <View style={StyleSheet.absoluteFill}>
              {/* Layer 1: Blur — samples content behind the tab bar */}
              <BlurView
                tint={darkMode ? 'dark' : 'light'}
                intensity={darkMode ? 40 : 85}
                style={StyleSheet.absoluteFill}
              />
              {/* Layer 2: Frosted glass overlay — the milky tint */}
              <LinearGradient
                colors={
                  darkMode
                    ? ['rgba(30, 30, 30, 0.35)', 'rgba(18, 18, 18, 0.55)']
                    : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.5)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
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
