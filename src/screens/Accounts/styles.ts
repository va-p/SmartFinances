import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';
import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const HeaderContainer = styled.View`
  min-height: 32%;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.backgroundCardHeader};
  border-bottom-right-radius: ${({ theme }) =>
    (theme as ThemeProps).borders.borderRadiusScreenSectionContent};
  border-bottom-left-radius: ${({ theme }) =>
    (theme as ThemeProps).borders.borderRadiusScreenSectionContent};
`;

export const Header = styled.View`
  align-items: center;
`;

export const CashFlowContainer = styled.View`
  margin-bottom: 8px;
`;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  text-align: center;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const SearchButton = styled(BorderlessButton)`
  position: absolute;
  top: 4px;
  right: 48px;
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

export const SectionTitleAndFilterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitleXl};
  padding-left: 16px;
  margin: 8px 0;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

type FooterProps = {
  bottomTabHeight: number;
};

export const Footer = styled.View<FooterProps>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
  margin-bottom: ${({ bottomTabHeight }) => bottomTabHeight}px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;
