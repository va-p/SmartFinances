import { FlatList } from 'react-native';
import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  height: ${RFPercentage(4)}px;
  align-items: center;
  justify-content: center;
  margin-top: ${getStatusBarHeight()}px;
  margin-bottom: ${RFPercentage(1)}px;
`;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  padding-bottom: 10px;
  margin-top: -5px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FiltersContainer = styled.View`
  align-items: center;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const ChartContainer = styled.View`
  width: 100%;
  height: ${RFPercentage(20)}px;
  justify-content: center;
  padding-bottom: 10px;
`;

export const Transactions = styled.View`
  flex: 1;
`;

export const TransactionList = styled(
  FlatList as new () => FlatList)
  .attrs({
    showsVerticalScrollIndicator: false,
    contentContainerStyle: {
      paddingBottom: getBottomSpace()
    }
  })``;


  export const MonthSelect = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
`;