import styled, { css } from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const AccountsContainer = styled.View`
  height: ${RFPercentage(45)}px;
`;

export const Title = styled.Text`
  text-align: center;
  font-size: ${RFValue(20)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.title};
  `};
`;

export const ContentScroll = styled.ScrollView`
  margin-top: 12px;
`;

export const Form = styled.View`
  height: ${RFPercentage(50)}px;
  padding: 10px 24px;
`;

export const Footer = styled.View`
  padding: 12px 0;
`;