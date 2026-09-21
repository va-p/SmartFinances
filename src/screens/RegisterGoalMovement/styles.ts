import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const ConversionNote = styled.Text`
  padding: 8px 16px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const PickerContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const Footer = styled.View`
  padding: 16px;
`;
