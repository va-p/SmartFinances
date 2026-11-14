import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  AccountName,
  Container,
  Footer,
  LastSyncDate,
} from './styles';

// Hooks
import { useBankingIntegrationDetailQuery } from '@hooks/useBankingIntegrationDetailQuery';
import {
  useOpeniConnect,
  openConnectSession,
} from '@hooks/useOpeniConnect';

import { router, useLocalSearchParams } from 'expo-router';
import { formatLastSyncDate } from '@utils/formatLastSyncDate';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { BANKING_CALLBACK_URL } from '@utils/openiConnect';

export function BankingIntegrationDetails() {
  const { bankingIntegrationID }: { bankingIntegrationID: string } =
    useLocalSearchParams();

  const { data: bankingIntegration, isLoading } =
    useBankingIntegrationDetailQuery(bankingIntegrationID);

  const [updating, setUpdating] = useState(false);
  const { mutateAsync: createConnectSession } = useOpeniConnect();

  const formattedLastSyncDate = useCallback(
    () => formatLastSyncDate(bankingIntegration?.lastSyncDate),
    [bankingIntegration]
  );

  async function handlePressUpdateAccount() {
    try {
      setUpdating(true);
      const session = await createConnectSession(BANKING_CALLBACK_URL);
      const params = await openConnectSession(session.connectUrl);
      if (!params) {
        setUpdating(false);
        return; // user dismissed the session
      }
      router.navigate({
        pathname: '/banking-callback',
        params: { itemId: params.itemId, status: params.status },
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível abrir a atualização da conexão. Por favor, tente novamente.'
      );
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading) {
    return <SkeletonAccountsScreen />;
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title
            title={`Conexão bancária ${bankingIntegration?.bankName}`}
          />
        </Header.Root>

        <AccountName isTitle={false}>
          Instituição Financeira:{' '}
          <AccountName isTitle>{bankingIntegration?.bankName}</AccountName>
        </AccountName>
        <LastSyncDate isTitle={false}>
          Data da últ. sincronização bem sucedida:{' '}
          <LastSyncDate isTitle>{formattedLastSyncDate}</LastSyncDate>
        </LastSyncDate>

        <AccountName isTitle={false}>
          Status da integração:{' '}
          <AccountName isTitle>{bankingIntegration?.status}</AccountName>{' '}
        </AccountName>

        <Footer>
          <Button.Root
            onPress={() => handlePressUpdateAccount()}
            disabled={updating}
          >
            <Button.Text text={updating ? 'Abrindo...' : 'Atualizar conexão'} />
          </Button.Root>
        </Footer>
      </Container>
    </Screen>
  );
}
