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
    theme.borders.borderRadiusScreenSectionContent};
  border-bottom-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
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
  padding: 8px 0;
`;

export const AccountsContent = styled.View`
  padding: 0 16px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  padding-left: 16px;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.title};
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;
