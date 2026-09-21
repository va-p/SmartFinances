import React from 'react';
import {
  Container,
  DetailsContainer,
  IconContainer,
  NameContainer,
  NameRow,
  Name,
  AccountCountBadge,
  AccountCountText,
  Amount,
  AmountsContainer,
} from './styles';

import { useTheme } from 'styled-components';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';

import {BankIcon} from 'phosphor-react-native/src/icons/Bank';
import {CaretRightIcon} from 'phosphor-react-native/src/icons/CaretRight';

import { ThemeProps } from '@interfaces/theme';

export type InstitutionCardData = {
  id: string;
  name: string;
  totalFormatted: string;
  accountCount: number;
  totalRaw: number;
};

type Props = RectButtonProps & {
  data: InstitutionCardData;
  index: number;
  hideAmount?: boolean;
};

export function InstitutionCard({
  data,
  index,
  hideAmount = false,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <IconContainer>
          <BankIcon color={theme.colors.primary} />
        </IconContainer>
        <NameContainer>
          <NameRow>
            <Name>{data.name}</Name>
            <AccountCountBadge>
              <AccountCountText>
                {data.accountCount} contas
              </AccountCountText>
            </AccountCountBadge>
          </NameRow>
          <AmountsContainer>
            <Amount>{!hideAmount ? data.totalFormatted : '•••••'}</Amount>
          </AmountsContainer>
        </NameContainer>
      </DetailsContainer>
      <CaretRightIcon size={16} color={theme.colors.text} />
    </Container>
  );
}
