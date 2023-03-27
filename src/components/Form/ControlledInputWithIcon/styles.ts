import { TextInput } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  width: 100%;
`;

export const ErrorMessage = styled.Text`
  font-size: ${RFValue(13)}px;
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
  width: 100%;
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
