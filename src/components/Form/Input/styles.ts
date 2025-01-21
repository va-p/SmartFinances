import { TextInput } from 'react-native';
import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Label = styled.Text`
  font-size: ${RFValue(14)}px;
  margin: 16px 0 -12px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.regular};
    color: ${theme.colors.shape};
  `};
`;

export const Container = styled.View`
  height: 40px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.shape};
  border: ${({ theme }) => theme.borders.default};
  border-radius: ${({ theme }) => theme.borders.borderRadiusButtonAndInput};
`;

export const InputText = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textPlaceholder,
}))`
  min-width: 85%;
  max-width: 85%;
  height: 48px;
  padding: 8px 0;
  padding-left: 20px;
  font-size: ${RFValue(14)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.regular};
    color: ${theme.colors.text};
  `};
  border-radius: 40px;
`;
