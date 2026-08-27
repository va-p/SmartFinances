import { Stack } from 'expo-router';

export default function GoalsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Metas & Objetivos' }} />
      <Stack.Screen name='[goalId]' options={{ title: 'Detalhes da Meta' }} />
      <Stack.Screen name='completed' options={{ title: 'Metas Concluídas' }} />
      <Stack.Screen name='archived' options={{ title: 'Metas Arquivadas' }} />
    </Stack>
  );
}
