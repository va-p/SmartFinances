import React from 'react';
import {
  Container,
  DetailsContainer,
  IconContainer,
  NameContainer,
  Name,
  Amount,
  AmountsContainer,
} from './styles';

import { AccountProps } from '@interfaces/accounts';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

import theme from '@themes/theme';

type Props = RectButtonProps & {
  data: AccountProps;
  index: number;
  icon: any;
  hideAmount?: boolean;
};

export function AccountListItem({
  data,
  index,
  icon,
  hideAmount = false,
  ...rest
}: Props) {
  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <IconContainer>
          <>{icon}</>
        </IconContainer>
        <NameContainer>
          <Name>{data.name}</Name>
          <AmountsContainer>
            <Amount>{!hideAmount ? data.balance : '•••••'}</Amount>
            {data.totalAccountAmountConverted && (
              <Amount style={{ fontSize: 12 }}>
                ({!hideAmount ? data.totalAccountAmountConverted : '•••••'})
              </Amount>
            )}
          </AmountsContainer>
        </NameContainer>
      </DetailsContainer>
      <CaretRight size={16} color={theme.colors.text} />
    </Container>
  );
}
