import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import { PrivacyPolicy } from '@screens/PrivacyPolicy';
import { TermsOfUse } from '@screens/TermsOfUse';
import { AppTabRoutes } from './app.tab.routes';
import { SignIn } from '@screens/SignIn';
import { SignUp } from '@screens/SignUp';


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
        name="SignUp"
        component={SignUp}
      />

      <Screen
        name="Termos de Uso"
        component={TermsOfUse}
      />

      <Screen 
        name="Política de Privacidade"
        component={PrivacyPolicy}
      />

      <Screen
        name="Home"
        component={AppTabRoutes}
      />
    </Navigator>
  )
}
