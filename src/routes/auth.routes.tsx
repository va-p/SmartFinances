import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { AppTabRoutes } from './app.tab.routes';
import { SignIn } from '@screens/SignIn';

const { Navigator, Screen } = createStackNavigator();

export function AuthRoutes() {
  return (
    <Navigator screenOptions={{
      headerShown: false,
    }}
    >
      <Screen
        name="SignIn"
        component={SignIn}
      />

      <Screen
        name="Home"
        component={AppTabRoutes}
      />
    </Navigator>
  )
}
