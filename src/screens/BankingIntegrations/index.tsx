import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, Text } from 'react-native';
import {
  ConnectedAccountsList,
  Container,
  PluggyConnectContainer,
} from './styles';

import { useRevenueCat } from '@providers/RevenueCatProvider';

import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { PluggyConnect } from 'react-native-pluggy-connect';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useUser } from '@storage/userStorage';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { AccountConnectedListItem } from '@components/AccountConnectedListItem';

import { Connector, BankingIntegration } from '@interfaces/bankingIntegration';

import api from '@api/api';

import theme from '@themes/theme';

export function BankingIntegrations({ navigation }: any) {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const route = useRoute();
  const showHeader: boolean = route.params?.showHeader;
  const { user } = useRevenueCat();
  const { id: userID } = useUser();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [token, setToken] = useState<string>();

  const [integrations, setIntegrations] = useState<BankingIntegration[]>([]);

  async function fetchBankingIntegrations() {
    try {
      setLoading(true);

      const response = await api.get('/banking_integration/get_integrations', {
        params: {
          user_id: userID,
        },
      });

      if (!!response.data && response.data.length > 0) {
        const data = response.data;
        setIntegrations(data);
      }
      return;
    } catch (error) {
      console.error('fetchBankingIntegrations error =>', error);
      Alert.alert(
        'Erro',
        'Não foi possível buscar suas integrações bancárias. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await api.get(
        '/banking_integration/get_and_sync_integrations',
        {
          params: {
            user_id: userID,
          },
        }
      );

      if (!!response.data && response.data.length > 0) {
        const data = response.data;
        setIntegrations(data);
      }

      return;
    } catch (error) {
      console.error('handleRefresh error =>', error);
      if (axios.isAxiosError(error)) {
        Alert.alert(
          'Atualização de Integrações',
          `${error?.response?.data?.message}. Por favor, tente novamente`,
          [{ text: 'OK' }]
        );
      }
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
          'banking_integration/pluggy_connect_token_create',
          {
            params: {
              user_id: userID,
            },
          }
        );

        if (!!data) {
          setToken(data);
        }
      } catch (error) {
        console.error('ConnectedAccounts fetchToken error =>', error);
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

  const handleOnSuccess = useCallback(async (itemData: Connector) => {
    try {
      setLoading(true);

      const { status } = await api.post('/banking_integration/create', {
        user_id: userID, // ID do usuário do app
        pluggy_integration_id: itemData.item.id, // O ID da integração no puggly (hash)
        connector_id: itemData.item.connector.id, // o ID da Instituição Financeira (conector)
        last_sync_date: new Date(), // Data da sincronização inicial
        bank_name: itemData.item.connector.name, // O nome da Instituição Financeira (conector)
        status: itemData.item.status,
        execution_status: itemData.item.executionStatus,
      });

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
    console.error('error', error);
    Alert.alert(
      'Erro',
      'Não foi possível conectar à conta. Por favor, tente novamente.'
    );
  }, []);

  const handleOnClose = useCallback(() => {
    setToken('');
    setShowModal(false);
  }, []);

  async function handleOpenBankingIntegration(
    bankingIntegration: BankingIntegration
  ) {
    try {
      setLoading(true);
      const { data, status } = await api.post(
        'banking_integration/pluggy_connect_token_create_itemId',
        {
          user_id: userID,
          banking_integration_id: bankingIntegration.id,
        }
      );

      if (status === 200 && !!data) {
        navigation.navigate('Integração Bancária', {
          bankingIntegration: bankingIntegration,
          connectToken: data,
        });
      }
    } catch (error) {
      console.error('handleOpenBankingIntegration error =>', error);
      Alert.alert(
        'Erro',
        'Não foi possível acessar sua integração bancária. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function _renderItem({ item }: any) {
    return (
      <AccountConnectedListItem
        data={item}
        onPress={() => handleOpenBankingIntegration(item)}
      />
    );
  }

  if (loading) {
    return (
      <Screen>
        <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Gradient />
          <Text style={{ color: theme.colors.text }}>Carregando...</Text>
        </Container>
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        {showHeader && (
          <Header.Root>
            <Header.BackButton />
            <Header.Title title='Integrações Bancárias' />
          </Header.Root>
        )}

        {user.premium && token && showModal && (
          <PluggyConnectContainer>
            <PluggyConnect
              connectToken={token}
              includeSandbox={false}
              connectorTypes={[]}
              onClose={handleOnClose}
              onSuccess={handleOnSuccess}
              onError={handleOnError}
              allowFullscreen
              theme='dark'
            />
          </PluggyConnectContainer>
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
                  onRefresh={() => handleRefresh()}
                />
              }
              ListFooterComponent={
                <Button.Root
                  type='secondary'
                  onPress={handlePressConnectNewAccount}
                >
                  <Button.Text
                    text={
                      !user.premium
                        ? 'Assine o Premium para novas conexões'
                        : 'Conectar nova conta'
                    }
                  />
                </Button.Root>
              }
              ListFooterComponentStyle={{ flex: 1, justifyContent: 'flex-end' }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: 8,
                paddingBottom: bottomTabBarHeight + 16,
              }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </Container>
    </Screen>
  );
}
