import React from 'react';
import {
  Container,
  AccountNameContainer,
  AccountName,
  StatusContainer,
  LastSyncDate,
  ConnectionStatus,
  MainContent,
} from './styles';

import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

import { BankingIntegration } from '@interfaces/bankingIntegration';

type Props = {
  data: BankingIntegration;
  onPress?: () => void;
};

export function AccountConnectedListItem({ data, onPress }: Props) {
  const formattedLastSyncDate = format(
    parseISO(data.last_sync_date),
    'dd/MM/yyyy',
    {
      locale: ptBR,
    }
  );
  return (
    <Container onPress={onPress}>
      <MainContent>
        <AccountNameContainer>
          <AccountName isTitle={false}>
            Inst. Financeira:{' '}
            <AccountName isTitle>{data.bank_name}</AccountName>
          </AccountName>
        </AccountNameContainer>
        <LastSyncDate isTitle={false}>
          Data Últ. Sinc.:{' '}
          <LastSyncDate isTitle>{formattedLastSyncDate}</LastSyncDate>
        </LastSyncDate>
      </MainContent>

      <StatusContainer>
        <ConnectionStatus
          status={data.status}
          executionStatus={data.execution_status}
        />
      </StatusContainer>
    </Container>
  );
}
