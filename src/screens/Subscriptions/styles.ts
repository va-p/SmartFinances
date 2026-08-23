import styled from 'styled-components/native';

import { Platform, TouchableOpacity } from 'react-native';

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
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
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
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const FooterTextContainer = styled.View`
  flex: 1;
  margin-right: 8px;
`;

export const FooterTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const FooterSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.9;
`;
