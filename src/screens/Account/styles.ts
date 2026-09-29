import { ThemeProps } from '@interfaces/theme';
import styled from 'styled-components/native';

type BalanceProps = {
  balanceIsPositive: boolean;
};

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const HeaderContainer = styled.View`
  margin: 8px 16px 0;
`;

export const HeaderButtonGroup = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 16px;
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
  background-color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const AccountBalance = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? (theme as ThemeProps).colors.success : (theme as ThemeProps).colors.attention};
`;

export const AccountBalanceDescription = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const AccountCashFlow = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? (theme as ThemeProps).colors.success : (theme as ThemeProps).colors.attention};
`;

export const AccountCashFlowDescription = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const Transactions = styled.View`
  padding: 0 16px;
`;
