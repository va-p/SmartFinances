import { TextInput } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.shapeDark};
  position: absolute;
  top: -20px;
  right: 0;
  z-index: 1;
`;

export const Input = styled(TextInput).attrs({})`
  min-height: 40px;
  max-height: 40px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.text};
`;
