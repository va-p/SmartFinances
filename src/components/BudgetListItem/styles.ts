import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

type BudgetProps = { is_amount_reached: boolean };

export const Container = styled(RectButton)`
  width: 100%;
  min-height: 80px;
  padding: 10px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.title};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountSpent = styled.Text<BudgetProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme, is_amount_reached }) =>
    is_amount_reached ? theme.colors.attention : theme.colors.success};
`;

export const AmountText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountBudget = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text};
`;

export const ChartContainer = styled.View``;

export const PeriodContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const StartPeriod = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

export const EndPeriod = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;
