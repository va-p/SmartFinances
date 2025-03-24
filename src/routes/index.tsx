import React from 'react';

import { useAuth } from '@contexts/AuthProvider';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';

import { AuthRoutes } from './auth.stack.routes';
import { AppTabRoutes } from './app.tab.routes';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

import theme from '@themes/theme';

const { Navigator, Screen } = createStackNavigator();

export function Routes() {
  const { loading, isSignedIn, user } = useAuth();

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  if (isSignedIn && user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar
            style='dark'
            backgroundColor={'rgba(255, 255, 255, 0.5)'}
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style='dark' backgroundColor={theme.colors.background} />
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
    </SafeAreaView>
  );
}
