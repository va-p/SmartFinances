import { TextInput } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type ColorProps = {
  color: string;
}

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
  padding: 10px;
`;

export const Icon = styled(Ionicons) <ColorProps>`
  font-size: ${RFValue(20)}px;
  margin-right: 15px;
  color: ${({ color }) => color};
`;

export const Input = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text
}))`
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
`;