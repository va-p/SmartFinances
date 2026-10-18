import styled from 'styled-components/native';
import { ThemeProps } from '@interfaces/theme';

type TitleProps = {
  primary?: boolean;
};

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 64px;
  color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;

export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 24px;
  text-align: center;
  margin-bottom: 32px;
  color: ${({ theme, primary = false }) =>
    primary
      ? (theme as ThemeProps).colors.primary
      : (theme as ThemeProps).colors.text};
`;

export const ButtonContainer = styled.View`
  margin-top: 32px;
`;
