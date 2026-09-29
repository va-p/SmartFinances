import { ThemeProps } from '@interfaces/theme';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 16px 16px 0;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const SummaryContainer = styled.View`
  align-items: center;
  padding: 8px 16px 16px;
`;

export const TotalBalance = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: 20px;
  text-align: center;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const TotalBalanceDescription = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  text-align: center;
  margin-top: -4px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const AccountsList = styled.View`
  flex: 1;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  margin: 8px 0;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;
