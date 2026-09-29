import { Platform, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px' : '8px 16px'};
`;

export const PeriodRow = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin-bottom: 16px;
  padding-horizontal: 16px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 10px;
`;

export const PeriodRowLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const PeriodLabel = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const PeriodValue = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const PeriodValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const TotalContainer = styled.View`
  margin-bottom: 16px;
`;

export const TotalRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 8px;
`;

export const TotalLabel = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const TotalValue = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const SectionHeaderTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const HeaderIconButton = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  padding: 8px;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const PeriodSheetContent = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
})``;
