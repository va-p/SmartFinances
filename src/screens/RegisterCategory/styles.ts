import styled, { css } from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  padding-top: ${getStatusBarHeight() + 10}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Title = styled.Text`
  text-align: center;
  font-size: ${RFValue(20)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.title};
  `};
`;

export const Form = styled.View`
  height: ${RFPercentage(45)}px;
  padding: 10px 24px;
`;