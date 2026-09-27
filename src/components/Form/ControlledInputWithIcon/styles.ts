import { TextInput } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  width: 100%;
  justify-items: center;
`;

export const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.attention};
`;

export const Content = styled.View`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
`;

export const Input = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: (theme as ThemeProps).colors.text,
}))`
  width: 90%;
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  padding-left: 8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
