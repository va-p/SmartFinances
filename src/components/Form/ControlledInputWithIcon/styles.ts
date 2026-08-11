import { TextInput } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  width: 100%;
`;

export const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.attention};
`;

export const Content = styled.View`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  padding: 16px;
`;

export const Input = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text,
}))`
  width: 90%;
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
