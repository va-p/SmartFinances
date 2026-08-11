import styled from 'styled-components/native';

type BudgetTotalType = 'positive' | 'negative';
type BudgetTotalProps = {
  type: BudgetTotalType;
};

export const Container = styled.View`
  flex: 1;
  padding: 16px 16px 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BudgetTotal = styled.Text<BudgetTotalProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  text-align: center;
  color: ${({ theme, type }) =>
    type === 'positive' ? theme.colors.success : theme.colors.attention};
`;

export const BudgetTotalDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const TransactionsContainer = styled.View`
  flex: 1;
  margin-top: 8px;
`;
