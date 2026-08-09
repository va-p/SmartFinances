import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${RFValue(12)}px;
  padding: 0 16px;
  color: ${({ theme }) => theme.colors.attention};
`;

export const Form = styled.View`
  padding: 0 16px;
`;

export const Footer = styled.View`
  padding: 16px;
`;
