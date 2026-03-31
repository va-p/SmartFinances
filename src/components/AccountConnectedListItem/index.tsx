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
    parseISO(data.lastSyncDate),
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
            Inst. Financeira: <AccountName isTitle>{data.bankName}</AccountName>
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
          executionStatus={data.executionStatus}
        />
      </StatusContainer>
    </Container>
  );
}
