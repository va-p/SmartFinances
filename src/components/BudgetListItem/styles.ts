import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';
import { ThemeProps } from '@interfaces/theme';

type BudgetProps = { is_amount_reached: boolean };

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: ${({ theme }) => (theme as ThemeProps).borders.borderRadiusShape};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountSpent = styled.Text<BudgetProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  color: ${({ theme, is_amount_reached: isAmountReached }) =>
    isAmountReached ? (theme as ThemeProps).colors.attention : (theme as ThemeProps).colors.success};
`;

export const AmountText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const AmountBudget = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const PeriodContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const StartPeriod = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const EndPeriod = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
