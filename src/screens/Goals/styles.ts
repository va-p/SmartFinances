import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px 20px' : '0 16px'};
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const HeaderActionButton = styled(BorderlessButton)`
  padding: 4px;
  margin-left: 8px;
`;

export const SummaryCard = styled.View`
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  align-items: center;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 25px;
`;

export const SummaryTotal = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: 24px;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const SummaryLabel = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const SummaryDescription = styled.Text`
  margin-top: 4px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const Footer = styled.View`
  padding: 16px 0 16px;
`;
