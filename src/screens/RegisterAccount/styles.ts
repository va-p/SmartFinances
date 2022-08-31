import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  height: ${RFPercentage(80)}px;
  padding: 10px;
`;

export const Footer = styled.View`
  padding: 0 20px;
`;