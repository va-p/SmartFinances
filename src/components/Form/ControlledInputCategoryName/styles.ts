import { TextInput } from 'react-native';
import styled, { css } from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.attention};
`;

export const Input = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text,
}))`
  width: 100%;
  padding: 4px 0;
  padding-left: 16px;
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  ${({ theme }) => css`
    font-family: ${theme.fonts.regular};
    border: 1px solid ${theme.colors.shape};
  `};
  color: ${({ theme }) => theme.colors.title};
`;
