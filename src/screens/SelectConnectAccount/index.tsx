import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Container } from './styles';

import { PluggyConnect } from 'react-native-pluggy-connect';

import { useUser } from '@storage/userStorage';

import api from '@api/api';
import axios from 'axios';

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

type Bank = 'BANK' | 'CREDIT';

type Subtype = 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_CARD';

interface ConnectAccount {
  id: string; // Unique identifier of the Account model, used to recover related transactions
  type: Bank;
  subtype: Subtype;
  number: number;
  name: string;
  marketingName: string;
  balance: number;
  itemId: string;
  taxNumber: number;
  owner: string;
  currencyCode: string;
  bankData: {
    transferNumber: string;
    closingBalance: number;
  };
}

export function SelectConnectAccount() {
  const { tenantId, id: userId } = useUser();
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState<string>();

  const [accounts, setAccounts] = useState<ConnectAccount>();

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true);
        const { data } = await api.post('pluggy_connect_token_create');

        if (!!data) {
          setToken(data);
        }
      } catch (error) {
        console.error('SelectConnectAccount fetchToken error =>', error);
        Alert.alert(
          'Erro',
          'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  // async function fetchKey() {
  //   try {
  //     // setLoading(true);
  //     const { data } = await api.post('pluggy_api_key_create');

  //     if (!!data) {
  //       // setToken(data);
  //       return data as string;
  //     }
  //     return;
  //   } catch (error) {
  //     console.error('SelectConnectAccount fetchToken error =>', error);
  //     Alert.alert(
  //       'Erro',
  //       'Não foi possível conectar ao Pluggy Connect. Por favor, tente novamente.'
  //     );
  //   }
  // }

  const handleOnOpen = useCallback(() => {
    console.log('open');
  }, []);

  const handleOnSuccess = useCallback(async (itemData: Connection) => {
    console.log('success', itemData);
    try {
      setLoading(true);

      // TODO:
      // 0 - Buscar o X-API-KEY que será usado na requisição seguinte (que buscará os dados da conta)
      // 1 - Usar o ID da integração bancária recém criada (itemData.item.id) para buscar os dados das contas desta conexão
      //
      // 0 - Chamar a API banking_integration_create do Xano, passando os dados da integração recém criada (itemData). Esta API será resposnável por:
      //  0.1 - Salvar os dados da integração bancária na tabela "banking_integration";
      //  0.2 - Salvar os dados das contas na tabela "account", passando o ID da integração que foi salva na tabela "banking_integration"; - OK
      //  0.3 - Salvar as transações na tabela "transaction";
      //

      const { status, data: newConnectedAccounts } = await api.post(
        '/banking_integration',
        // TODO: Subir um array com as contas junto do objeto da conexão em si, este array será usado para replicar as contas na tabela account
        {
          tenant_id: tenantId, // ID do usuário do app
          pluggy_integration_id: itemData.item.id, // O ID da integração no puggly (hash)
          last_sync_date: new Date(), // Data da sincronização inicial
          bank_id: itemData.item.connector.id, // o ID da Instituição Financeira
          bank_name: itemData.item.connector.name, // O nome da Instituição Financeira
        }
      );

      if (status === 200) {
        console.log('newConnectedAccounts =>', newConnectedAccounts);
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

    // Passe apenas o itemData.id para o backend
  }, []);

  const handleOnError = useCallback((error) => {
    console.log('error', error);
  }, []);

  const handleOnClose = useCallback(() => {
    setToken('');
  }, []);

  // console.log('token ===>', token);

  return (
    <Container>
      {/* <ComingSoon>Em breve</ComingSoon> */}
      {token && (
        <PluggyConnect
          connectToken={token}
          includeSandbox={true}
          connectorTypes={[]}
          onOpen={handleOnOpen}
          onClose={handleOnClose}
          onSuccess={handleOnSuccess}
          onError={handleOnError}
        />
      )}
    </Container>
  );
}
