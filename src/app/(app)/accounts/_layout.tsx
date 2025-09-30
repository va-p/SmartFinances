import { Stack } from 'expo-router';

export default function AccountsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Todas as Contas' }} />
      <Stack.Screen name='[accountId]' options={{ title: 'Conta' }} />
      <Stack.Screen name='editAccount' options={{ title: 'Editar Conta' }} />
      <Stack.Screen
        name='bankingIntegrations'
        options={{ title: 'Integrações Bancárias' }}
      />
      <Stack.Screen
        name='bankingIntegrationDetails'
        options={{ title: 'Detalhes da Integração Bancária' }}
      />
      <Stack.Screen name='subscription' options={{ title: 'Assinatura' }} />
    </Stack>
  );
}
