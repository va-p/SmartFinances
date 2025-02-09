import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { SignIn } from '@screens/SignIn';
import { SignUp } from '@screens/SignUp';
import { Welcome } from '@screens/Welcome';
import { AppTabRoutes } from './app.tab.routes';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

const { Navigator, Screen } = createStackNavigator();

export function AuthRoutes() {
  const skipWelcomeScreen = storageConfig.getBoolean(
    `${DATABASE_CONFIGS}.skipWelcomeScreen`
  );

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={skipWelcomeScreen ? 'SignIn' : 'Welcome'}
    >
      <Screen name='Welcome' component={Welcome} />

      <Screen name='SignIn' component={SignIn} />

      <Screen name='SignUp' component={SignUp} />

      <Screen name='Home' component={AppTabRoutes} />
    </Navigator>
  );
}
