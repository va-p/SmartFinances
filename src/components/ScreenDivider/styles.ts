import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  height: 24px;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  column-gap: 16px;
`;

export const Line = styled.View`
  min-width: 30%;
  max-width: 30%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: left;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;
