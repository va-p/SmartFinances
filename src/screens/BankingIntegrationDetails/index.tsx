import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  AccountName,
  Container,
  Footer,
  LastSyncDate,
  PluggyConnectContainer,
} from './styles';

// Hooks
import { useBankingIntegrationDetailQuery } from '@hooks/useBankingIntegrationDetailQuery';

import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { OneSignal } from 'react-native-onesignal';
import { router, useLocalSearchParams } from 'expo-router';
import { PluggyConnect } from 'react-native-pluggy-connect';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

export function BankingIntegrationDetails() {
  const {
    bankingIntegrationID,
    connectToken: token,
  }: { bankingIntegrationID: string; connectToken: string } =
    useLocalSearchParams();

  const { data: bankingIntegration, isLoading } =
    useBankingIntegrationDetailQuery(bankingIntegrationID);

  const [showModal, setShowModal] = useState(false);

  const formattedLastSyncDate = useCallback(() => {
    if (!bankingIntegration) return '';

    return format(
      parseISO(bankingIntegration.last_sync_date || ''),
      'dd/MM/yyyy',
      {
        locale: ptBR,
      }
    );
  }, [bankingIntegration]);

  async function handlePressUpdateAccount() {
    try {
      setShowModal(true);
    } catch (error) {
      console.error('BankingIntegrationDetails fetchToken error =>', error);
      Alert.alert(
        'Erro',
        'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
      );
    }
  }

  function handleOnSuccess() {
    OneSignal.InAppMessages.addTrigger(
      'pluggy_integration_updating_start',
      'show'
    );

    // TODO: Updates on Xano
    Alert.alert(
      'Suas integrações bancárias estão sendo atualizadas...',
      'Em alguns minutos o processo será finalizado!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  }

  function handleOnError(error: any) {
    console.error('error', error);
    Alert.alert(
      'Erro',
      'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
    );
  }

  const handleOnClose = useCallback(() => {
    setShowModal(false);
  }, []);

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
            title={`Conexão bancária ${bankingIntegration.bank_name}`}
          />
        </Header.Root>

        {token && showModal && (
          <PluggyConnectContainer>
            <PluggyConnect
              connectToken={token}
              updateItem={bankingIntegration.pluggy_integration_id}
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
            <AccountName isTitle={false}>
              Instituição Financeira:{' '}
              <AccountName isTitle>{bankingIntegration.bank_name}</AccountName>
            </AccountName>
            <LastSyncDate isTitle={false}>
              Data da últ. sincronização bem sucedida:{' '}
              <LastSyncDate isTitle>{formattedLastSyncDate}</LastSyncDate>
            </LastSyncDate>

            <AccountName isTitle={false}>
              Saúde da conexão com a Inst. Financeira:{' '}
              <AccountName isTitle>{bankingIntegration.health}</AccountName>{' '}
              {/** TODO: Adc func. para tratar textos */}
            </AccountName>

            <AccountName isTitle={false}>
              Status da integração:{' '}
              <AccountName isTitle>{bankingIntegration.status}</AccountName>{' '}
              {/** TODO: Adc func. para tratar textos */}
            </AccountName>

            <AccountName isTitle={false}>
              Status da última sincronização:{' '}
              <AccountName isTitle>
                {bankingIntegration.execution_status}
              </AccountName>{' '}
              {/** TODO: Adc func. para tratar textos */}
            </AccountName>

            <Footer>
              <Button.Root onPress={handlePressUpdateAccount}>
                <Button.Text text={'Atualizar conexão'} />
              </Button.Root>
            </Footer>
          </>
        )}
      </Container>
    </Screen>
  );
}
