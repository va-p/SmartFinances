import React, { useEffect, useState } from 'react';
import { AppRegistry, Platform, StatusBar } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux'
import * as Font from 'expo-font';

import { AuthProvider } from './src/hooks/auth';
import store from './src/store'

import { Routes } from './src/routes';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/themes/theme';

// Need manually add Intl polyfill for react-native app
import 'intl';

AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'android') {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === 'function') {
    (Intl as any).__disableRegExpRestore();
  }
}
import 'intl/locale-data/jsonp/en';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_700Bold
        });
      } catch (error) {
        console.error(error);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StatusBar barStyle="light-content" />
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}