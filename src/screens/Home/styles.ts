import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  height: ${RFPercentage(4)}px;
  align-items: center;
  justify-content: center;
  margin-top: ${getStatusBarHeight() - 18}px;
  margin-bottom: ${RFPercentage(1)}px;
`;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  padding-bottom: 10px;
  margin-top: -5px;
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

export const Transactions = styled.View`
  flex: 1;
`;