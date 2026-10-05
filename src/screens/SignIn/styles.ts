import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  padding-top: 16px;
`;

export const SectionHeader = styled.View`
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
`;

export const MainContent = styled.View`
  flex: 1;
  border-top-left-radius: ${({ theme }) =>
    (theme as ThemeProps).borders.borderRadiusScreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    (theme as ThemeProps).borders.borderRadiusScreenSectionContent};
  align-items: center;
  row-gap: 8px;
  padding: 64px 8px 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.backgroundCardHeader};
`;

export const LogoWrapper = styled.View`
  width: 100%;
  height: 20%;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})``;

export const LogoText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  text-align: left;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const FormWrapper = styled.View`
  width: 70%;
  row-gap: 16px;
  margin-bottom: 8px;
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const SocialLoginButton = styled(RectButton)`
  width: 70%;
  min-height: 40px;
  max-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border: ${({ theme }) => (theme as ThemeProps).borders.default};
  border-radius: ${({ theme }) => (theme as ThemeProps).borders.borderRadiusButtonAndInput};
`;
