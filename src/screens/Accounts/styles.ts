import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  height: ${RFPercentage(4.5)}px;
  align-items: center;
  justify-content: center;
  margin-top: ${getStatusBarHeight() - 30}px;
  margin-bottom: ${RFPercentage(1)}px;
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
  margin-top: -10px;
  color: ${({ theme }) => theme.colors.text};
`;

export const HideDataButton = styled(BorderlessButton)`
  position: absolute;
  top: 0px;
  right: 10px;
`;

export const ChartContainer = styled.View`
  width: 100%;
  height: ${RFPercentage(20)}px;
  justify-content: center;
  padding-bottom: 10px;
`;

export const AccountsContainer = styled.View`
  min-height: ${RFPercentage(53)}px;
  max-height: ${RFPercentage(53)}px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;