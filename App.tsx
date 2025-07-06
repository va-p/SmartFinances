import React, { useEffect, useState } from 'react';

import * as Font from 'expo-font';
import * as Updates from 'expo-updates';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Splash } from '@components/Splash';

import { AuthProvider } from '@contexts/AuthProvider';
import { RevenueCatProvider } from './src/providers/RevenueCatProvider';

import { Routes } from '@routes/index';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/themes/theme';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

enum LoadingState {
  Initializing,
  LoadingFonts,
  Ready,
}

function App() {
  const [loadingState, setLoadingState] = useState(LoadingState.Initializing);

  OneSignal.Debug.setLogLevel(LogLevel.Verbose); // OneSignal Debugging
  OneSignal.initialize('9b887fe6-28dc-495a-939b-ae527403a302');
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('OneSignal: notification clicked:', event);
  });

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
    async function prepareApp() {
      try {
        await Promise.all([
          onFetchUpdateAsync(),
          NavigationBar.setBackgroundColorAsync(theme.colors.backgroundNav),
          NavigationBar.setButtonStyleAsync('dark'),
        ]);

        setLoadingState(LoadingState.LoadingFonts);
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_700Bold,
        });
      } catch (error) {
        console.error(`Error during app load: ${error}`);
      }
    }

    prepareApp();
  }, []);

  switch (loadingState) {
    case LoadingState.Initializing:
      return null;

    case LoadingState.LoadingFonts:
      return <Splash onComplete={() => setLoadingState(LoadingState.Ready)} />;

    case LoadingState.Ready:
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider theme={theme}>
              <RevenueCatProvider>
                <ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
                  <AuthProvider>
                    <Routes />
                  </AuthProvider>
                </ClerkProvider>
              </RevenueCatProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
  }
}

export default App;
