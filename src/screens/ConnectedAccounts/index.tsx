import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, Text } from 'react-native';
import { ConnectedAccountsList, Container } from './styles';

import { PluggyConnect } from 'react-native-pluggy-connect';
import { useRoute } from '@react-navigation/native';

import { useUser } from '@storage/userStorage';

import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { AccountConnectedListItem } from '@components/AccountConnectedListItem';

import api from '@api/api';

import theme from '@themes/theme';
import { useRevenueCat } from 'src/providers/RevenueCatProvider';

interface Connection {
  item: {
    connector: {
      id: number; // 201 - ID da instituição financeira
      imageUrl: string; // "https://cdn.pluggy.ai/assets/connector-icons/201.svg",
      name: string; // "Itaú" - Nome da instituição financeira
    };
    executionStatus: string; // "SUCCESS",
    id: string; // "57063906-888f-4cfb-b437-169728a9d769" - O ID da integração no puggly (hash)
    status: string; // 'UPDATED';
  };
}

interface BankingIntegration {
  bankName: string;
  connectorId: string;
  lastSyncDate: string | Date;
  status: string;
}

export function ConnectedAccounts({ navigation }: any) {
  const route = useRoute();
  const showHeader: boolean = route.params?.showHeader;
  const { user } = useRevenueCat();
  const { tenantId: tenantID, id: userID } = useUser();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [token, setToken] = useState<string>();

  const [integrations, setIntegrations] = useState<BankingIntegration[]>([]);

  async function syncAccounts() {
    try {
      setLoading(true);

      const resp = await api.get('banking_integration/get_transactions', {
        params: {
          user_id: userID,
        },
      });
      // console.log('banking_integration/get_transactions resp ===>', resp);
    } catch (error) {
      console.error(`Erro ao sincronizar a conta:`, error);
      Alert.alert(
        'Erro',
        'Não foi possível sincronizar os dados das contas. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchBankingIntegrations(isRefresh: boolean = false) {
    try {
      !isRefresh && setLoading(true);
      isRefresh && setRefreshing(true);

      const response = await api.get('/banking_integration/get_integrations', {
        params: {
          user_id: userID,
        },
      });

      if (!!response.data && response.data.length > 0) {
        const data = response.data;
        setIntegrations(data);
        await syncAccounts();
      }
      return;
    } catch (error) {
      console.error('Erro ao verificar contas conectadas:', error);
      Alert.alert(
        'Erro',
        'Não foi possível buscar suas integrações bancárias. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true);
        const { data } = await api.post(
          'banking_integration/pluggy_connect_token_create'
        );

        if (!!data) {
          setToken(data);
        }
      } catch (error) {
        console.error('SelectConnectAccount fetchToken error =>', error);
        Alert.alert(
          'Erro',
          'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
        );
      }
    }

    fetchToken();
    fetchBankingIntegrations();
  }, []);

  function handlePressConnectNewAccount() {
    if (!user.premium) {
      navigation.navigate('Assinatura');
      return;
    }

    setShowModal(true);
  }

  const handleOnSuccess = useCallback(async (itemData: Connection) => {
    try {
      setLoading(true);

      const { status, data: newConnectedAccounts } = await api.post(
        '/banking_integration/create',
        {
          user_id: userID, // ID do usuário do app
          tenant_id: tenantID, // ID do tenant do app
          pluggy_integration_id: itemData.item.id, // O ID da integração no puggly (hash)
          last_sync_date: new Date(), // Data da sincronização inicial
          connector_id: itemData.item.connector.id, // o ID da Instituição Financeira (conector)
          bank_name: itemData.item.connector.name, // O nome da Instituição Financeira (conector)
        }
      );

      if (status === 200) {
        Alert.alert(
          'Contas conectadas com sucesso!',
          'A instituição financeira foi conectada com sucesso e suas contas foram importadas!'
        );
      }
    } catch (error) {
      console.error(
        'SelectConnectAccount create banking_conection error =>',
        error
      );
      Alert.alert(
        'Erro',
        'Não foi possível salvar os dados da sua conta. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOnError = useCallback((error: any) => {
    console.log('error', error);
    Alert.alert(
      'Erro',
      'Não foi possível conectar à conta. Por favor, tente novamente.'
    );
  }, []);

  const handleOnClose = useCallback(() => {
    setToken('');
    setShowModal(false);
  }, []);

  function _renderItem({ item }: any) {
    const account = {
      bankName: item.bank_name,
      connectorId: item.connector_id,
      lastSyncDate: item.last_sync_date,
      status: item.status,
    };

    return <AccountConnectedListItem data={account} />;
  }

  if (loading) {
    return (
      <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.text }}>Carregando...</Text>
      </Container>
    );
  }

  return (
    <Container>
      {showHeader && (
        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Contas Conectadas' />
        </Header.Root>
      )}

      {user.premium && token && showModal && (
        <PluggyConnect
          connectToken={token}
          includeSandbox={true}
          connectorTypes={[]}
          onClose={handleOnClose}
          onSuccess={handleOnSuccess}
          onError={handleOnError}
          allowFullscreen
          theme='dark'
        />
      )}

      {!showModal && (
        <>
          <ConnectedAccountsList
            data={integrations}
            keyExtractor={(item: any) => item.id}
            renderItem={_renderItem}
            ListEmptyComponent={() => (
              <ListEmptyComponent text='Nenhuma conta conectada ainda. Conecte suas contas e cartões de crédito para que suas trasações sejam importadas automaticamente! Suas contas conectadas serão exibidas aqui.' />
            )}
            initialNumToRender={10}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchBankingIntegrations(true)}
              />
            }
            showsVerticalScrollIndicator={false}
          />

          <Button
            type='secondary'
            title={
              !user.premium
                ? 'Assine o Premium para novas conexões'
                : 'Conectar nova conta'
            }
            onPress={handlePressConnectNewAccount}
          />
        </>
      )}
    </Container>
  );
}
