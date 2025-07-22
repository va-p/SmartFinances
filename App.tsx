import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules, AppState, Platform } from 'react-native';

const { InAppUpdate } = NativeModules;

import * as Font from 'expo-font';
import * as Updates from 'expo-updates';
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
  const appState = useRef(AppState.currentState);
  const [queryClient] = useState(() => new QueryClient());
  const [loadingState, setLoadingState] = useState(LoadingState.Initializing);

  const checkNativeUpdate = useCallback(() => {
    // Este módulo só existe no Android.
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
    async function onFetchUpdateOtaAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.error(`Error fetching latest Expo (OTA) update: ${error}`);
      }
    }

    async function prepareApp() {
      try {
        await Promise.all([
          onFetchUpdateOtaAsync(),
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
        console.error(`Error during app preparation: ${error}`);
      } finally {
        // Movemos a transição de estado para o finally para garantir que o app
        // avance mesmo se uma das promises falhar (ex: falha de rede no OTA).
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
