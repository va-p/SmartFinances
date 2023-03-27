import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const Header = styled.View`
  height: 70%;
  align-items: center;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const TitleWrapper = styled.View`
  align-items: center;
`;

export const Title = styled.Text`
  text-align: center;
  margin-top: 45px;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(30)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SignInTitle = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(16)}px;
  margin-top: 80px;
  margin-bottom: 67px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Footer = styled.View`
  height: 30%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const FooterWrapper = styled.View`
  margin-top: ${RFPercentage(-8)}px;
  justify-content: space-between;
  padding: 0 32px;
`;

export const WrapperTextSignUp = styled.View`
  align-items: flex-end;
  margin-top: 3%;
`;

export const TextSignUp = styled.Text`
  color: ${({ theme }) => theme.colors.background};
`;

export const LinkSignUp = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.background};
`;
