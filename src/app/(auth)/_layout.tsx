import { StatusBar } from 'react-native';

import { Stack } from 'expo-router';
import { useTheme } from 'styled-components';

import { useUserConfigs } from '@storage/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

export default function AuthLayout() {
  const theme: ThemeProps = useTheme();
  const { darkMode } = useUserConfigs();

  return (
    <>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.statusBar}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name='index' />
        <Stack.Screen name='signIn' />
        <Stack.Screen name='signUp' />
        <Stack.Screen name='forgotPassword' />
        <Stack.Screen name='resetPassSentConfirmation' />
      </Stack>
    </>
  );
}
