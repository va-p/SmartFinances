import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

type BudgetProps = { is_amount_reached: boolean };

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  width: 100%;
  padding: 12px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  color: ${({ theme }) => theme.colors.title};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountSpent = styled.Text<BudgetProps>`
  font-family: ${({ theme }) => theme.fonts.bold};
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
