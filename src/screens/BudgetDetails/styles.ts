import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

type BudgetTotalType = 'positive' | 'negative';
type BudgetTotalProps = {
  type: BudgetTotalType;
};

export const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BudgetTotal = styled.Text<BudgetTotalProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  text-align: center;
  color: ${({ theme, type }) =>
    type === 'positive' ? theme.colors.success : theme.colors.attention};
`;

export const BudgetTotalDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;
