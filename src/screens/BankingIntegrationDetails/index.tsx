import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  AccountName,
  Container,
  Footer,
  LastSyncDate,
  PluggyConnectContainer,
} from './styles';

import { useNavigation, useRoute } from '@react-navigation/native';
import { PluggyConnect } from 'react-native-pluggy-connect';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

import { BankingIntegration as BankingIntegrationProps } from '@interfaces/bankingIntegration';

export function BankingIntegrationDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const bankingIntegration: BankingIntegrationProps =
    route.params?.bankingIntegration;
  const token: string = route.params?.connectToken;

  const [showModal, setShowModal] = useState(false);

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
    // TODO: Updates on Xano
    Alert.alert(
      'Conta atualizada com sucesso!',
      'A instituição financeira foi atualizada com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }

  function handleOnError(error: any) {
    console.log('error', error);
    Alert.alert(
      'Erro',
      'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
    );
  }

  const handleOnClose = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
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

      <AccountName isTitle={false}>
        Instituição Financeira:{' '}
        <AccountName isTitle>{bankingIntegration.bank_name}</AccountName>
      </AccountName>
      <LastSyncDate isTitle={false}>
        Data da últ. sincronização bem sucedida:{' '}
        <LastSyncDate isTitle>{bankingIntegration.last_sync_date}</LastSyncDate>
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
        <AccountName isTitle>{bankingIntegration.execution_status}</AccountName>{' '}
        {/** TODO: Adc func. para tratar textos */}
      </AccountName>

      <Footer>
        <Button.Root
          type='secondary'
          onPress={handlePressUpdateAccount}
          style={{ maxWidth: '50%' }}
        >
          <Button.Text type='secondary' text={'Atualizar conexão'} />
        </Button.Root>
      </Footer>
    </Container>
  );
}
