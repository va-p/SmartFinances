import { Platform, TextInput } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.shapeDark};
  position: absolute;
  top: -20px;
  right: 0;
  z-index: 1;
`;

export const Input = styled(TextInput).attrs({})`
  min-height: ${Platform.OS === 'ios' ? '40px' : '48px'};
  max-height: ${Platform.OS === 'ios' ? '40px' : '48px'};
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 18px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
