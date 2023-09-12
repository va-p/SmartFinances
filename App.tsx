import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from 'styled-components';
import CodePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import * as Font from 'expo-font';

import store from './src/store';

import { Routes } from './src/routes';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/themes/theme';

SplashScreen.preventAutoHideAsync();

const CODE_PUSH_OPTIONS = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
};

function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_700Bold,
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
          <StatusBar
            barStyle='light-content'
            backgroundColor={theme.colors.background}
          />
          <Routes />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default CodePush(CODE_PUSH_OPTIONS)(App);
