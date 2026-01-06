import { StatusBar, View } from 'react-native';

import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components';

import { useUserConfigs } from '@storage/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

export default function AuthLayout() {
  const theme: ThemeProps = useTheme();
  const { darkMode } = useUserConfigs();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle={darkMode ? 'light-content' : 'dark-content'}
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

      {insets.bottom > 0 && (
        <View
          style={{
            height: insets.bottom,
            backgroundColor: theme.colors.background,
          }}
        />
      )}
    </View>
  );
}
