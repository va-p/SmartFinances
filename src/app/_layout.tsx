import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import * as Font from 'expo-font';
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

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import darkTheme from '@themes/darkTheme';
import lightTheme from '@themes/lightTheme';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
  const deviceColorScheme = useColorScheme();
  const useDarkMode = deviceColorScheme === 'dark';
  const theme = useDarkMode ? darkTheme : lightTheme;

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
          <ClerkProvider publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY || ''}>
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
