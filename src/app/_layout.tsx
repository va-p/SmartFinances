import React, { useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import * as Font from 'expo-font';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments } from 'expo-router';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SkeletonHomeScreen } from '@components/SkeletonOverviewScreen';

import { AuthProvider, useAuth } from '@providers/AuthProvider';
import { RevenueCatProvider } from '@providers/RevenueCatProvider';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useQuotes } from '@storage/quotesStorage';
import { useQuotesQuery } from '@hooks/useQuotesQuery';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useCurrenciesQuery } from '@hooks/useCurrenciesQuery';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import darkTheme from '@themes/darkTheme';
import lightTheme from '@themes/lightTheme';
import { useCurrenciesStore } from '@storage/currenciesStore';

SplashScreen.preventAutoHideAsync();

const PUBLIC_CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// In-memory token cache so Clerk sessions do NOT survive app restarts.
// When the app is killed and reopened, the user must authenticate again.
const inMemoryCache = new Map<string, string>();

const tokenCache = {
  async getToken(key: string) {
    return inMemoryCache.get(key) || null;
  },
  async saveToken(key: string, value: string) {
    inMemoryCache.set(key, value);
  },
};

function RootNavigationLayout() {
  const { data: currenciesData, isLoading: isLoadingCurrencies } =
    useCurrenciesQuery();
  const setCurrencies = useCurrenciesStore((state) => state.setCurrencies);

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuotesQuery();
  const {
    setBrlQuoteBtc,
    setBrlQuoteEur,
    setBrlQuoteUsd,
    setBtcQuoteBrl,
    setBtcQuoteEur,
    setBtcQuoteUsd,
    setEurQuoteBrl,
    setEurQuoteBtc,
    setEurQuoteUsd,
    setUsdQuoteBrl,
    setUsdQuoteBtc,
    setUsdQuoteEur,
  } = useQuotes();

  const { isSignedIn, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const skipWelcomeScreen = storageConfig.getBoolean(
    `${DATABASE_CONFIGS}.skipWelcomeScreen`
  );

  useEffect(() => {
    if (!!currenciesData) {
      setCurrencies(currenciesData);
    }
  }, [currenciesData]);

  useEffect(() => {
    if (!!quotesData) {
      setBrlQuoteBtc(quotesData.brlToBtc);
      setBrlQuoteEur(quotesData.brlToEur);
      setBrlQuoteUsd(quotesData.brlToUsd);

      setBtcQuoteBrl(quotesData.btcToBrl);
      setBtcQuoteEur(quotesData.btcToEur);
      setBtcQuoteUsd(quotesData.btcToUsd);

      setEurQuoteBrl(quotesData.eurToBrl);
      setEurQuoteBtc(quotesData.eurToBtc);
      setEurQuoteUsd(quotesData.eurToUsd);

      setUsdQuoteBrl(quotesData.usdToBrl);
      setUsdQuoteBtc(quotesData.usdToBtc);
      setUsdQuoteEur(quotesData.usdToEur);
    }
  }, [quotesData]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      const destination = skipWelcomeScreen ? '/(auth)/signIn' : '/(auth)';
      router.replace(destination);
    }

    if (isSignedIn && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isSignedIn, loading, segments, router, skipWelcomeScreen]);

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  const inAuthGroup = segments[0] === '(auth)';
  if (!isSignedIn && !inAuthGroup) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const setDarkMode = useUserConfigs((state) => state.setDarkMode);
  const setSortingOption = useUserConfigs((state) => state.setSortingOption);
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

  // Restore persisted sorting preference (client-only, not from backend).
  const savedSorting = storageConfig.getString(
    `${DATABASE_CONFIGS}.sortingOption`
  );
  if (
    savedSorting === 'name-asc' ||
    savedSorting === 'name-desc' ||
    savedSorting === 'balance-asc' ||
    savedSorting === 'balance-desc'
  ) {
    setSortingOption(savedSorting);
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

  // The app manages light/dark mode manually (independent of the OS setting),
  // but native iOS chrome — like the Liquid Glass tab bar's blur material —
  // reads the real UITraitCollection userInterfaceStyle, which the Info.plist
  // locks to Light. Without this, the native tab bar renders its light-mode
  // glass material even when the app is in dark mode, showing as a light-gray
  // tinted blur instead of a proper dark, translucent glass effect.
  useEffect(() => {
    Appearance.setColorScheme(useDarkMode ? 'dark' : 'light');
  }, [useDarkMode]);

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
            <QueryClientProvider client={queryClient}>
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
