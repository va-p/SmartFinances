import styled, { css } from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  padding-top: ${getStatusBarHeight() + 10}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const AccountsContainer = styled.View`
  height: ${RFPercentage(45)}px;
`;

export const Title = styled.Text`
  text-align: center;
  font-size: ${RFValue(24)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.title};
  `};
`;

export const ContentScroll = styled.ScrollView`
`;

export const Form = styled.View`
  height: ${RFPercentage(50)}px;
  padding: 10px 24px;
`;

export const Footer = styled.View`
  padding: 12px 0;
`;