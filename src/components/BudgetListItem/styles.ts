import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton)`
  width: 100%;
  min-height: 80px;
  max-height: 80px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountSpent = styled.Text``;

export const AmountBudget = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
`;

export const PeriodContainer = styled.View`
  flex-direction: row;
`;
