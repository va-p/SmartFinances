import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.KeyboardAvoidingView`
  padding-top: 16px;
`;

export const PasswordHint = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  color: ${({ theme }) => (theme as ThemeProps).colors.textPlaceholder};
  padding: 0 16px;
  margin-top: -12px;
`;

export const MainContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
  },
})`
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
`;
