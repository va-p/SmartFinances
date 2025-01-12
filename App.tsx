import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';

import * as Font from 'expo-font';
import * as Updates from 'expo-updates';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Routes } from './src/routes';
import { RevenueCatProvider } from 'src/providers/RevenueCatProvider';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/themes/theme';
import { AuthProvider } from '@contexts/AuthProvider';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();

    (async () => {
      await NavigationBar.setBackgroundColorAsync('#020027');
      await NavigationBar.setButtonStyleAsync('light');
    })();

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
      <ThemeProvider theme={theme}>
        <RevenueCatProvider>
          <ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <AuthProvider>
              <StatusBar
                barStyle='light-content'
                backgroundColor={theme.colors.background}
              />
              <Routes />
            </AuthProvider>
          </ClerkProvider>
        </RevenueCatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
