import React, { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  AccountName,
  Container,
  Footer,
  LastSyncDate,
  SectionTitle,
  AccountRow,
  AccountRowMain,
  AccountRowName,
  AccountRowMeta,
  AccountRowBalance,
  EmptyAccountsText,
} from './styles';

// Hooks
import { useBankingIntegrationDetailQuery } from '@hooks/useBankingIntegrationDetailQuery';
import { openConnectSession } from '@hooks/useOpeniConnect';

import { useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { formatLastSyncDate } from '@utils/formatLastSyncDate';
import formatCurrency from '@utils/formatCurrency';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import api from '@api/api';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: 'Conta bancária',
  CREDIT: 'Cartão de crédito',
  INVESTMENTS: 'Investimento',
  OTHER: 'Outra conta',
};

const ACCOUNT_SUBTYPE_LABELS: Record<string, string> = {
  CHECKING_ACCOUNT: 'Conta corrente',
  SAVINGS_ACCOUNT: 'Poupança',
  CREDIT_CARD: 'Cartão de crédito',
};

function accountTypeLabel(type?: string | null, subtype?: string | null) {
  if (subtype && ACCOUNT_SUBTYPE_LABELS[subtype]) {
    return ACCOUNT_SUBTYPE_LABELS[subtype];
  }
  if (type && ACCOUNT_TYPE_LABELS[type]) return ACCOUNT_TYPE_LABELS[type];
  return type ?? 'Conta';
}

export function BankingIntegrationDetails() {
  const {
    bankingIntegrationID,
  }: {
    bankingIntegrationID: string;
  } = useLocalSearchParams();

  const { data: bankingIntegration, isLoading } =
    useBankingIntegrationDetailQuery(bankingIntegrationID);

  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const formattedLastSyncDate = useCallback(
    () => formatLastSyncDate(bankingIntegration?.lastSyncDate),
    [bankingIntegration]
  );

  async function refreshDetails() {
    await queryClient.invalidateQueries({
      queryKey: ['bankingIntegration', bankingIntegrationID],
    });
  }

  /**
   * Re-authorizes this specific item at the provider without creating a
   * new integration. Opens the provider's own authorization page; the
   * background webhooks finish the sync afterwards.
   */
  async function handlePressUpdateAccount() {
    try {
      setUpdating(true);
      const { data } = await api.post(
        `/banking-integration/${bankingIntegrationID}/reconnect`
      );
      const url: string | undefined = data?.authUrl ?? data?.consentUrl;
      if (!url) {
        Alert.alert(
          'Atualização solicitada',
          'A instituição foi notificada. Os dados serão atualizados em instantes — puxe para atualizar.'
        );
        await refreshDetails();
        return;
      }
      const params = await openConnectSession(url);
      if (!params) {
        await refreshDetails();
        return; // user dismissed the session
      }
      await refreshDetails();
      Alert.alert(
        'Conexão atualizada',
        'Sua instituição foi reconectada. Os dados serão sincronizados em instantes.'
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a conexão. Por favor, tente novamente.'
      );
    } finally {
      setUpdating(false);
    }
  }

  if (isLoading) {
    return <SkeletonAccountsScreen />;
  }

  const accounts = bankingIntegration?.accounts ?? [];

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title
            title={`Conexão bancária ${bankingIntegration?.bankName ?? ''}`}
          />
        </Header.Root>

        <AccountName isTitle={false}>
          Instituição Financeira:{' '}
          <AccountName isTitle>
            {bankingIntegration?.bankName ?? '—'}
          </AccountName>
        </AccountName>

        <AccountName isTitle={false}>
          Status da integração:{' '}
          <AccountName isTitle>{bankingIntegration?.status ?? '—'}</AccountName>
        </AccountName>

        <LastSyncDate isTitle={false}>
          Data da últ. sincronização bem sucedida:{' '}
          <LastSyncDate isTitle>{formattedLastSyncDate()}</LastSyncDate>
        </LastSyncDate>

        <SectionTitle>
          Contas conectadas ({accounts.length})
        </SectionTitle>

        {accounts.length === 0 ? (
          <EmptyAccountsText>
            Nenhuma conta importada ainda. Conclua a autorização ou aguarde a
            sincronização.
          </EmptyAccountsText>
        ) : (
          <View>
            {accounts.map((account) => (
              <AccountRow key={account.id}>
                <AccountRowMain>
                  <AccountRowName>{account.name}</AccountRowName>
                  <AccountRowMeta>
                    {accountTypeLabel(account.type, account.subtype)}
                  </AccountRowMeta>
                </AccountRowMain>
                <AccountRowBalance>
                  {formatCurrency(
                    account.currency?.code ?? 'BRL',
                    Number(account.balance ?? 0)
                  )}
                </AccountRowBalance>
              </AccountRow>
            ))}
          </View>
        )}

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
