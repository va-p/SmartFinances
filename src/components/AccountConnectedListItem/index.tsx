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

import { BankingIntegration } from '@interfaces/bankingIntegration';
import { formatLastSyncDate } from '@utils/formatLastSyncDate';

type Props = {
  data: BankingIntegration;
  onPress?: () => void;
};

export function AccountConnectedListItem({ data, onPress = undefined }: Props) {
  const formattedLastSyncDate = formatLastSyncDate(data.lastSyncDate);

  return (
    <Container onPress={onPress}>
      <MainContent>
        <AccountNameContainer>
          <AccountName isTitle={false}>
            Inst. Financeira: <AccountName isTitle>{data.bankName}</AccountName>
          </AccountName>
        </AccountNameContainer>
        <LastSyncDate isTitle={false}>
          Última Atualização:{' '}
          <LastSyncDate isTitle>{formattedLastSyncDate}</LastSyncDate>
        </LastSyncDate>
      </MainContent>

      <StatusContainer>
        <ConnectionStatus status={data.status} />
      </StatusContainer>
    </Container>
  );
}
