import { TextInput } from 'react-native';
import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.attention};
`;

export const Input = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text,
}))`
  width: 100%;
  padding: 4px 0;
  padding-left: 16px;
  font-size: ${RFValue(12)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.regular};
    border: 1px solid ${theme.colors.shape};
  `};
  color: ${({ theme }) => theme.colors.title};
`;
