import React from 'react';

import { useAuth } from '@clerk/clerk-expo';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { AuthRoutes } from './auth.stack.routes';
import { AppTabRoutes } from './app.tab.routes';
import { TransactionsByCategory } from '@screens/TransactionsByCategory';

import { useUser } from '@storage/userStorage';

const { Navigator, Screen } = createStackNavigator();

export function Routes() {
  const { isSignedIn } = useAuth();
  const { id: userID, name, lastName, email } = useUser();

  if (isSignedIn) {
  }

  if (isSignedIn) {
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
