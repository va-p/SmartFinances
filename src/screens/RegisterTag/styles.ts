import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
`;

export const Body = styled.View`
  min-height: ${RFPercentage(50)}px;
  max-height: ${RFPercentage(50)}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 10px;
`;

export const Footer = styled.View`
  min-height: ${RFPercentage(30)}px;
  max-height: ${RFPercentage(30)}px;
  justify-content: flex-end;
  padding: 0 10px;
`;