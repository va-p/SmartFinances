import React from 'react';

import { useAuth } from '../contexts/AuthProvider';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Load } from '@components/Load';

import { AuthRoutes } from './auth.stack.routes';
import { AppTabRoutes } from './app.tab.routes';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

const { Navigator, Screen } = createStackNavigator();

export function Routes() {
  const { loading, isSignedIn, user } = useAuth();
  console.log('isSignedIn ???', isSignedIn);
  console.log('user ==>', user);

  if (loading) {
    return <Load />;
  }

  if (isSignedIn && user) {
    return (
      <NavigationContainer>
        <BottomSheetModalProvider>
          <Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: false,
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
