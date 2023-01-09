import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 10px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;

export const ComingSoon = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;