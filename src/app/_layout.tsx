import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import * as Font from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, useSegments } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SkeletonHomeScreen } from '@components/SkeletonOverviewScreen';

import { AuthProvider, useAuth } from '@contexts/AuthProvider';
import { RevenueCatProvider } from '../providers/RevenueCatProvider';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useUserConfigs } from '@stores/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import darkTheme from '@themes/darkTheme';
import lightTheme from '@themes/lightTheme';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function RootNavigationLayout() {
  const { isSignedIn, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const skipWelcomeScreen = storageConfig.getBoolean(
    `${DATABASE_CONFIGS}.skipWelcomeScreen`
  );

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === '(app)';

    if (isSignedIn && !inAppGroup) {
      router.replace('/(app)/');
    }

    if (!isSignedIn && inAppGroup) {
      const destination = skipWelcomeScreen ? '/(auth)/signIn' : '/(auth)/';
      router.replace(destination);
    }
  }, [isSignedIn, loading, segments, router]);

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(auth)' />
      <Stack.Screen name='(app)' />
    </Stack>
  );
}

export default function RootLayout() {
  const setDarkMode = useUserConfigs((state) => state.setDarkMode);

  const deviceColorScheme = useColorScheme();
  const darkModeUserConfig: boolean | undefined = storageConfig.getBoolean(
    `${DATABASE_CONFIGS}.darkMode`
  );
  let useDarkMode: boolean;

  if (darkModeUserConfig !== undefined) {
    useDarkMode = darkModeUserConfig;
  } else {
    useDarkMode = deviceColorScheme === 'dark';
  }

  const theme = useDarkMode ? darkTheme : lightTheme;
  setDarkMode(useDarkMode);

  const [fontsLoaded, fontError] = Font.useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <RevenueCatProvider>
          <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
          >
            <QueryClientProvider client={new QueryClient()}>
              <AuthProvider>
                <BottomSheetModalProvider>
                  <RootNavigationLayout />
                </BottomSheetModalProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ClerkProvider>
        </RevenueCatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
