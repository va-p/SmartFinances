import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, Text, BackHandler } from 'react-native';
import {
  ConnectedAccountsList,
  Container,
} from './styles';

import axios from 'axios';
import { useTheme } from 'styled-components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';
import { useOpeniConnect, openConnectSession } from '@hooks/useOpeniConnect';
import { BANKING_CALLBACK_URL } from '@utils/openiConnect';

import { canCreateConnection } from '@utils/benefitsLimits';
import { useBenefits } from '@stores/benefitsStorage';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { AccountConnectedListItem } from '@components/AccountConnectedListItem';

import { ThemeProps } from '@interfaces/theme';
import { BankingIntegration } from '@interfaces/bankingIntegration';

import api from '@api/api';

function EmptyList() {
  return (
    <ListEmptyComponent text='Nenhuma conta conectada ainda. Conecte suas contas e cartões de crédito para que suas transações sejam importadas automaticamente! Suas contas conectadas serão exibidas aqui.' />
  );
}
export function BankingIntegrations() {
  const theme = useTheme() as ThemeProps;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { showHeader } = useLocalSearchParams();
  const usage = useBenefits((state) => state.usage);
  const limits = useBenefits((state) => state.limits);
  // BEN-44: connection gating is plan-limit based (not the legacy premium flag)
  const canConnect = canCreateConnection(usage, limits);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [integrations, setIntegrations] = useState<BankingIntegration[]>([]);

  const { mutateAsync: createConnectSession } = useOpeniConnect();

  async function fetchBankingIntegrations() {
    try {
      setLoading(true);

      const response = await api.get('/banking-integration/');

      if (!!response.data && response.data.length > 0) {
        const { data } = response;
        setIntegrations(data);
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível buscar suas integrações bancárias. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setLoading(true);
    setRefreshing(true);

    try {
      const response = await api.get('/banking-integration/sync');

      if (!!response.data && response.data.length > 0) {
        const { data } = response;
        setIntegrations(data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // BEN-47: sync is refused while an integration is RESTRICTED —
        // surface the restriction instead of a generic failure.
        if (error?.response?.data?.code === 'INTEGRATION_RESTRICTED') {
          Alert.alert(
            'Integração restrita',
            'Uma ou mais contas conectadas estão restritas (somente leitura) porque seu plano não cobre seu uso atual. Renove seu plano para reativar a sincronização.',
            [{ text: 'OK' }]
          );
          return;
        }
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
    fetchBankingIntegrations();
  }, []);

  async function handlePressConnectNewAccount() {
    if (!canConnect) {
      router.navigate('/options/subscription');
      return;
    }

    try {
      setLoading(true);
      const session = await createConnectSession(BANKING_CALLBACK_URL);
      await openConnectSession(session.connectUrl);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível abrir a conexão bancária. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  const handleOpenBankingIntegration = useCallback(
    async (bankingIntegration: BankingIntegration) => {
      setLoading(true);

      try {
        router.navigate({
          pathname: '/accounts/bankingIntegrationDetails',
          params: {
            bankingIntegrationID: bankingIntegration.id,
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  function renderItem({ item }: any) {
    return (
      <>
        <AccountConnectedListItem
          data={item}
          onPress={() => handleOpenBankingIntegration(item)}
        />
        {item.access_status === 'RESTRICTED' && (
          <Text
            style={{
              color: theme.colors.attention,
              fontFamily: theme.fonts.medium,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Conta conectada restrita (somente leitura) — renove para reativar
          </Text>
        )}
      </>
    );
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
  }, [router]);

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

        <ConnectedAccountsList
          data={integrations}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => renderItem({ item })}
          ListEmptyComponent={EmptyList}
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
              onPress={() => handlePressConnectNewAccount()}
            >
              <Button.Text
                text={
                  !canConnect
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
      </Container>
    </Screen>
  );
}
