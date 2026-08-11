import styled from 'styled-components/native';

type BalanceProps = {
  balanceIsPositive: boolean;
};

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const HeaderContainer = styled.View`
  margin: 8px 16px 0;
`;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

export const FilterButtonGroup = styled.View`
  width: 24%;
`;

export const AccountBalanceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

export const AccountBalanceGroup = styled.View`
  width: 48%;
  min-height: 60px;
  max-height: 60px;
  align-items: center;
  justify-content: center;
`;

export const AccountBalanceSeparator = styled.View`
  min-width: 2px;
  max-width: 2px;
  min-height: 40px;
  max-height: 40px;
  background-color: ${({ theme }) => theme.colors.text};
`;

export const AccountBalance = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountBalanceDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubTitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AccountCashFlow = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountCashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubTitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Transactions = styled.View`
  padding: 0 16px;
`;
