import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { AppDrawerRoutes } from './app.drawer.routes';
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
        component={AppDrawerRoutes}
      />
    </Navigator>
  )
}
