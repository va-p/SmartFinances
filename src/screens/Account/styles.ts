import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

type BalanceProps = {
  balanceIsPositive: boolean;
};

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  min-height: ${RFPercentage(8)}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Platform.OS === 'ios' ? '24px 16px 0' : '16px 16px 0'};
`;

export const BackButton = styled(BorderlessButton)`
  position: absolute;
  top: ${Platform.OS === 'ios' ? '24px' : '16px'};
  left: 16px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const TitleContainer = styled.View`
  height: 100%;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const EditAccountButton = styled(BorderlessButton)`
  position: absolute;
  top: ${Platform.OS === 'ios' ? '24px' : '16px'};
  right: 16px;
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
  font-size: ${RFValue(16)}px;
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountBalanceDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AccountCashFlow = styled.Text<BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountCashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Transactions = styled.View`
  flex: 1;
`;
