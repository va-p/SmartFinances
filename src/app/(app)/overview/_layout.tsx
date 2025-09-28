import { Stack } from 'expo-router';

export default function AccountsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' options={{ title: 'Visão Geral' }} />
      <Stack.Screen
        name='[categoryId]'
        options={{ title: 'Transações por Categoria' }}
      />
    </Stack>
  );
}
