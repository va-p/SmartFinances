import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type BalanceProps = {
  balanceIsPositive: boolean;
}

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  flex-direction: row;
  width: 100%;
  height: ${RFPercentage(4.5)}px;
  align-items: center;
  justify-content: center;
  margin-top: ${getStatusBarHeight() - 30}px;
  margin-bottom: ${RFPercentage(1)}px;
`;

export const BackButton = styled(BorderlessButton)`
  position: absolute;
  top: 0px;
  left: 10px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const TitleContainer = styled.View``;

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
  margin-top: -10px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FiltersContainer = styled.View`
  height: ${RFPercentage(3.5)}px;
  align-items: center;
  justify-content: center;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const EditAccountButton = styled(BorderlessButton)`
  position: absolute;
  top: 0px;
  right: 10px;
`;

export const AccountBalanceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
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
  min-height: 45px;
  max-height: 45px;
  background-color: ${({ theme }) => theme.colors.text};
`;

export const AccountBalance = styled.Text <BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountBalanceDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  margin-top: -10px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AccountCashFlow = styled.Text <BalanceProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  color: ${({ theme, balanceIsPositive }) =>
    balanceIsPositive ? theme.colors.success : theme.colors.attention};
`;

export const AccountCashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  margin-top: -10px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Transactions = styled.View`
  flex: 1;
`;