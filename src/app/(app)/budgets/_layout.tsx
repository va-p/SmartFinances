import { Stack } from 'expo-router';

export default function AccountsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Todos os Orçamentos' }} />
      <Stack.Screen name='[budgetId]' options={{ title: 'Orçamento' }} />
      <Stack.Screen name='editBudget' options={{ title: 'Editar Orçamento' }} />
    </Stack>
  );
}
