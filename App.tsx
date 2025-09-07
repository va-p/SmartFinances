import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeModules,
  AppState,
  Platform,
  useColorScheme,
} from 'react-native';

const { InAppUpdate } = NativeModules;

import * as Font from 'expo-font';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Splash } from '@components/Splash';

import { AuthProvider } from '@contexts/AuthProvider';
import { RevenueCatProvider } from './src/providers/RevenueCatProvider';

import { useUserConfigs } from '@storage/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import { Routes } from '@routes/index';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import darkTheme from '@themes/darkTheme';
import lightTheme from '@themes/lightTheme';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

enum LoadingState {
  Initializing,
  LoadingFonts,
  Ready,
}

function App() {
  const setDarkMode = useUserConfigs((state) => state.setDarkMode);
  const deviceColorScheme: 'dark' | 'light' | null | undefined =
    useColorScheme();
  const darkModeUserConfig: boolean | undefined = storageConfig.getBoolean(
    `${DATABASE_CONFIGS}.darkMode`
  );
  let useDarkMode: boolean;
  if (darkModeUserConfig !== undefined) {
    useDarkMode = darkModeUserConfig;
  } else {
    useDarkMode = deviceColorScheme === 'dark';
  }
  console.log('useDarkMode =======>', useDarkMode);
  const theme = useDarkMode ? darkTheme : lightTheme;
  setDarkMode(useDarkMode);
  const appState = useRef(AppState.currentState);
  const [queryClient] = useState(() => new QueryClient());
  const [loadingState, setLoadingState] = useState(LoadingState.Initializing);

  const checkNativeUpdate = useCallback(() => {
    // This module exists only on Android.
    if (Platform.OS !== 'android' || !InAppUpdate) {
      return;
    }

    InAppUpdate.checkForUpdates()
      .then((message: string) => {
        console.log('[InAppUpdate] Resultado da verificação:', message);
      })
      .catch((error: Error) => {
        console.error('[InAppUpdate] Falha ao verificar atualização:', error);
      });
  }, []);

  useEffect(() => {
    checkNativeUpdate();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (Platform.OS === 'android' && InAppUpdate) {
          InAppUpdate.onResume();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkNativeUpdate]);

  useEffect(() => {
    async function prepareApp() {
      try {
        await Promise.all([
          NavigationBar.setBackgroundColorAsync(theme.colors.backgroundNav),
          NavigationBar.setButtonStyleAsync(useDarkMode ? 'dark' : 'light'),
        ]);

        setLoadingState(LoadingState.LoadingFonts);
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_500Medium,
          Poppins_700Bold,
        });
      } catch (error) {
        console.error(`Error during app preparation: ${error}`);
      }
    }

    prepareApp();

    // Inicializa o OneSignal uma única vez
    // OneSignal.Debug.setLogLevel(LogLevel.Verbose); // Debug
    OneSignal.initialize('9b887fe6-28dc-495a-939b-ae527403a302');
  }, []);

  switch (loadingState) {
    case LoadingState.Initializing:
      return null;

    case LoadingState.LoadingFonts:
      return (
        <Splash
          onComplete={() => {
            setLoadingState(LoadingState.Ready);
            SplashScreen.hideAsync();
          }}
        />
      );

    case LoadingState.Ready:
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider theme={theme}>
              <RevenueCatProvider>
                <ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}>
                  <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                      <Routes />
                    </QueryClientProvider>
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
