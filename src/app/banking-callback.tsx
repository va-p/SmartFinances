import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import api from '@api/api';
import { validateCallbackParams } from '@utils/openiConnect';

/**
 * Return leg of the Openi Connect flow (feature: openi-integration).
 *
 * The widget redirects here with `?itemId=&status=`. On success the item
 * is bound to the user (the backend fills connector and bank details from
 * the provider); on error — or with invalid params — nothing is created.
 */
export default function BankingCallbackScreen() {
  const { itemId, status } = useLocalSearchParams<{
    itemId?: string | string[];
    status?: string | string[];
  }>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = validateCallbackParams(
      Array.isArray(itemId) ? itemId[0] : itemId,
      Array.isArray(status) ? status[0] : status
    );

    if (!params) {
      Alert.alert(
        'Erro',
        'Não foi possível concluir a conexão bancária. Por favor, tente novamente.',
        [{ text: 'OK', onPress: () => router.replace('/accounts/bankingIntegrations') }]
      );
      return;
    }

    if (params.status === 'error') {
      Alert.alert(
        'Erro',
        'A conexão com o banco falhou. Por favor, tente novamente.',
        [{ text: 'OK', onPress: () => router.replace('/accounts/bankingIntegrations') }]
      );
      return;
    }

    (async () => {
      try {
        await api.post('/banking-integration/create', {
          providerIntegrationId: params.itemId,
        });
        Alert.alert('Contas conectadas com sucesso!', 'A instituição financeira foi conectada e suas contas serão importadas!', [
          { text: 'OK', onPress: () => router.replace('/accounts/bankingIntegrations') },
        ]);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível salvar a conexão. Por favor, tente novamente.', [
          { text: 'OK', onPress: () => router.replace('/accounts/bankingIntegrations') },
        ]);
      }
    })();
  }, [itemId, status]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' color='#FF5200' />
    </View>
  );
}
