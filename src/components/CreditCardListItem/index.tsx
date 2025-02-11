import React from 'react';
import {
  Amount,
  AmountContainer,
  Container,
  Name,
  NameContainer,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { AccountProps } from '@interfaces/accounts';
import { FadeInLeft } from 'react-native-reanimated';

type Props = RectButtonProps & {
  data: AccountProps;
  index: number;
  hideAmount?: boolean;
};

export function CreditCardListItem({
  data,
  index,
  hideAmount = false,
  ...rest
}: Props) {
  return (
    <Container entering={FadeInLeft.delay(index * 100)} {...rest}>
      <AmountContainer>
        <Amount>{!hideAmount ? data.balance : '•••••'}</Amount>
        {data.totalAccountAmountConverted && (
          <Amount style={{ fontSize: 12 }}>
            ({!hideAmount ? data.totalAccountAmountConverted : '•••••'})
          </Amount>
        )}
      </AmountContainer>

      <NameContainer>
        <Name>{data.name}</Name>
      </NameContainer>
    </Container>
  );
}
