import React from 'react';
import {
  Container,
  Name,
  AmountContainer,
  AmountCurrent,
  AmountText,
  AmountTarget,
  FooterContainer,
  Deadline,
  ReachedBadge,
  ReachedBadgeText,
} from './styles';

import formatCurrency from '@utils/formatCurrency';

import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';
import { useTheme } from 'styled-components';

import { CheckIcon } from 'phosphor-react-native/src/icons/Check';

import { GoalPercentBar } from '@components/GoalListItem/components/GoalPercentBar';

import { ThemeProps } from '@interfaces/theme';
import { GoalProps } from '@interfaces/goals';
import { GoalProgress } from '@utils/goalCalculations';

type Props = RectButtonProps & {
  data: GoalProps;
  progress: GoalProgress;
  hideAmount: boolean;
  index: number;
  /** Overrides the deadline line (e.g. completion date on concluded goals). */
  footerText?: string;
};

export function GoalListItem({
  data,
  progress,
  hideAmount,
  index,
  footerText,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;

  const target = formatCurrency(
    data.currency.code,
    Number(data.target_amount),
    false
  );

  const footer =
    footerText ??
    (data.deadline
      ? `Prazo: ${format(new Date(data.deadline), 'dd MMMM, yyyy', {
          locale: ptBR,
        })}`
      : null);

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <Name>{data.name}</Name>
      <AmountContainer>
        <AmountCurrent is_amount_reached={progress.isAmountReached}>
          {hideAmount ? '••••• ' : `${progress.currentFormatted} `}
        </AmountCurrent>
        <AmountText>de </AmountText>
        <AmountTarget>{hideAmount ? '•••••' : target}</AmountTarget>
      </AmountContainer>

      <GoalPercentBar
        percentage={progress.percentage}
        isAmountReached={progress.isAmountReached}
      />

      <FooterContainer>
        <Deadline>{footer ?? ''}</Deadline>
        {progress.isAmountReached && (
          <ReachedBadge>
            <CheckIcon size={12} weight='bold' color={theme.colors.shape} />
            <ReachedBadgeText> Meta atingida</ReachedBadgeText>
          </ReachedBadge>
        )}
      </FooterContainer>
    </Container>
  );
}
