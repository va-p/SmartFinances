import { Stack } from 'expo-router';

export default function AccountsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Mais Opções' }} />
      <Stack.Screen name='profile' options={{ title: 'Perfil' }} />
      <Stack.Screen name='subscription' options={{ title: 'Assinatura' }} />
      <Stack.Screen name='accountsList' options={{ title: 'Contas' }} />
      <Stack.Screen
        name='bankingIntegrations'
        options={{ title: 'Integrações Bancárias' }}
      />
      <Stack.Screen
        name='bankingIntegrationDetails'
        options={{ title: 'Detalhes da Integração Bancária' }}
      />
      <Stack.Screen name='categories' options={{ title: 'Categorias' }} />
      <Stack.Screen name='tags' options={{ title: 'Etiquetas' }} />
    </Stack>
  );
}
