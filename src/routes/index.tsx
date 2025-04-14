import React from 'react';
import { StatusBar } from 'react-native';

import { useAuth } from '@contexts/AuthProvider';

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
      <NavigationContainer>
        <StatusBar
          barStyle='dark-content'
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
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle='dark-content'
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
