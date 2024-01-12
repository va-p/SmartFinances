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

import * as Icon from 'phosphor-react-native';
import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';

import theme from '@themes/theme';

type Props = RectButtonProps & {
  data: AccountProps;
  index: number;
  icon: any;
  hide_amount: boolean;
};

export function AccountListItem({
  data,
  index,
  icon,
  hide_amount,
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
            <Amount>{!hide_amount ? data.totalAccountAmount : '•••••'}</Amount>
            {data.totalAccountAmountConverted && (
              <Amount style={{ fontSize: 12 }}>
                ({!hide_amount ? data.totalAccountAmountConverted : '•••••'})
              </Amount>
            )}
          </AmountsContainer>
        </NameContainer>
      </DetailsContainer>
      <Icon.CaretRight size={16} color={theme.colors.text} />
    </Container>
  );
}
