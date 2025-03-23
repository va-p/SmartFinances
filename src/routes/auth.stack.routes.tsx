import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { SignIn } from '@screens/SignIn';
import { SignUp } from '@screens/SignUp';
import { Welcome } from '@screens/Welcome';
import { AppTabRoutes } from './app.tab.routes';
import { ForgotPassword } from '@screens/ForgotPassword';
import { ResetPasswordSentConfirmation } from '@screens/ResetPasswordSentConfirmation';

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import { RootParamList } from 'src/@types/navigation';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

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

      <Screen name='ForgotPassword' component={ForgotPassword} />

      <Screen
        name='ResetPassSentConfirmation'
        component={ResetPasswordSentConfirmation}
      />

      <Screen name='SignUp' component={SignUp} />

      <Screen name='Home' component={AppTabRoutes} />
    </Navigator>
  );
}
