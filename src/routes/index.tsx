import React from 'react';
import { StatusBar } from 'react-native';

import { useAuth } from '@contexts/AuthProvider';

import { useTheme } from 'styled-components';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';

import { AuthRoutes } from './auth.stack.routes';
import { AppTabRoutes } from './app.tab.routes';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

import { ThemeProps } from '@interfaces/theme';
import { useUserConfigs } from '@storage/userConfigsStorage';

const { Navigator, Screen } = createStackNavigator();

export function Routes() {
  const theme: ThemeProps = useTheme();
  const { darkMode } = useUserConfigs();
  const { loading, isSignedIn, user } = useAuth();

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  if (isSignedIn && user) {
    return (
      <NavigationContainer>
        <StatusBar
          barStyle={darkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.backgroundCardHeader}
        />
        <BottomSheetModalProvider>
          <Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: false,
              cardStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Screen name='Main' component={AppTabRoutes} />
            <Screen
              name='Transações Por Categoria'
              component={TransactionsByCategory}
            />
          </Navigator>
        </BottomSheetModalProvider>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <BottomSheetModalProvider>
        <Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: false,
          }}
        >
          <Screen name='Auth' component={AuthRoutes} />
        </Navigator>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}
