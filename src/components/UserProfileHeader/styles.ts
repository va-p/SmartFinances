import styled from 'styled-components/native';

import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  align-items: center;
  padding: ${getStatusBarHeight() + 33}px 20px 24px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const GreetingContainer = styled.View`
  flex-direction: row;
`;

export const Greeting = styled.Text`
  margin-right: 5px;
  font-size: ${RFValue(24)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const UserName = styled.Text`
  font-size: ${RFValue(24)}px;
  color: ${({ theme }) => theme.colors.shape};
`;