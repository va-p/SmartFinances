import React from 'react';
import {
  Container,
  AccountNameAndEditBtContainer,
  AccountName,
  EditButton,
  StatusContainer,
  LastSyncDate,
  ConnectionStatus,
} from './styles';

import { DotsThreeCircle } from 'phosphor-react-native';

import theme from '@themes/theme';

interface AccountConnected {
  bankName: string;
  connectorId: string;
  lastSyncDate: string | Date;
  status: string;
}

type Props = {
  data: AccountConnected;
  onPress?: () => void;
};

export function AccountConnectedListItem({ data, onPress }: Props) {
  return (
    <Container>
      <AccountNameAndEditBtContainer>
        <AccountName isTitle>
          Inst. Financeira:{' '}
          <AccountName isTitle={false}>{data.bankName}</AccountName>
        </AccountName>
        <EditButton onPress={onPress}>
          <DotsThreeCircle size={20} color={theme.colors.primary} />
        </EditButton>
      </AccountNameAndEditBtContainer>
      <StatusContainer>
        <LastSyncDate isTitle>
          Data Últ. Sinc.:{' '}
          <LastSyncDate isTitle={false}>{`${data.lastSyncDate}`}</LastSyncDate>
        </LastSyncDate>
        <ConnectionStatus />
      </StatusContainer>
    </Container>
  );
}
