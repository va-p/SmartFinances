import styled, { css } from 'styled-components/native';

import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding-top: ${getStatusBarHeight() + 10}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Title = styled.Text`
  text-align: center;
  font-size: ${RFValue(24)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.title};
  `};
`;

export const Form = styled.View`
  height: ${RFPercentage(30)}px;
  padding: 0 24px;
`;