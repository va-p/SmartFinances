import { Platform, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px' : '8px 16px'};
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 12px;
`;

export const SectionHeaderTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const HelpButton = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  padding: 4px;
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

export const Footer = styled(TouchableOpacity).attrs({
  activeOpacity: 0.85,
})`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
`;

export const FooterTextContainer = styled.View`
  flex: 1;
  margin-right: 8px;
`;

export const FooterTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const FooterSubtitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
  opacity: 0.9;
`;

// ── Add subscription: choice modal options ───────────

export const OptionsContainer = styled.View`
  padding: 16px;
  gap: 12px;
`;

export const OptionRow = styled(TouchableOpacity).attrs({
  activeOpacity: 0.85,
})`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
`;

export const OptionIconContainer = styled.View`
  width: 32px;
  align-items: center;
`;

export const OptionTextsContainer = styled.View`
  flex: 1;
  padding-left: 12px;
`;

export const OptionTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const OptionSubtitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
