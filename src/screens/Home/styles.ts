import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  align-items: center;
  padding: ${Platform.OS === 'ios' ? '24px 16px 0' : '12px 16px 0'};
`;

export const CashFlowContainer = styled.View``;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  text-align: center;
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
  top: 16px;
  right: 16px;
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

export const CloseCashFlowAlertButton = styled(BorderlessButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export const CashFlowAlertContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: 0 8px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 8px;
`;

export const CashFlowAlertTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.title};
`;

export const CashFlowAlertText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;
