import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  min-height: ${RFPercentage(8)}px;
  align-items: center;
  justify-content: center;
  padding: 12px 12px 0;
`;

export const CashFlowContainer = styled.View``;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.title};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const HideDataButton = styled(BorderlessButton)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const Transactions = styled.View`
  flex: 1;
`;

export const TransactionsSectionHeader = styled.View`
  flex: 1;
  justify-content: center;
  padding: 2px 10px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const TransactionsSectionText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.title};
`;