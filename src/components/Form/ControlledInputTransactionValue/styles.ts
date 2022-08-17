import { TextInput } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

import theme from '@themes/theme';

export const Container = styled.View`
  width: 100%;
`;

export const ErrorMessage = styled.Text`
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.background};
`;

export const Input = styled(TextInput).attrs({
  placeholderTextColor: theme.colors.background
})`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.background};
`;