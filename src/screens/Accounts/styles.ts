import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const HeaderContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
  border-bottom-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
  border-bottom-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
`;

export const Header = styled.View`
  align-items: center;
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
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const HideDataButton = styled(BorderlessButton)`
  position: absolute;
  top: 4px;
  right: 16px;
`;

export const ChartContainer = styled.View`
  min-height: 200px;
  max-height: 200px;
  justify-content: center;
  padding: 0 16px;
`;

export const AccountsContainer = styled.View`
  flex: 1;
  padding: 8px 16px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;
