import { FlatList } from 'react-native';
import styled from 'styled-components/native';

import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  height: ${RFPercentage(5)}px;
  align-items: center;
  justify-content: flex-end;
  margin-top: ${getStatusBarHeight()}px;
`;

export const CashFlowGroup = styled.View`
  align-items: center;
`;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  padding-bottom: 12px;
  margin-top: -12px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Chart = styled.View`
  width: 100%;
  height: ${RFPercentage(25)}px;
  justify-content: center;
  padding: 10px;
`;

export const MonthSelect = styled.View`
  width: 100%;
  height: ${RFPercentage(2)}px;
  flex-direction: row;
  align-items: center;
  padding-top: 20px;
  margin-bottom: -20px;
  justify-content: center;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const Transactions = styled.View`
  flex: 1%;
  padding: 0 10px;
`;

export const TransactionList = styled(
  FlatList as new () => FlatList)
  .attrs({
    showsVerticalScrollIndicator: false,
    contentContainerStyle: {
      paddingBottom: getBottomSpace()
    }
  })``;