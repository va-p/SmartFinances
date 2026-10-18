import styled from 'styled-components/native';
import { ThemeProps } from '@interfaces/theme';

type TitleProps = {
  primary?: boolean;
};

export const Container = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  row-gap: 32px;
  padding-horizontal: 24px;
`;

export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 24px;
  text-align: center;
  color: ${({ theme, primary = false }) =>
    primary ? (theme as ThemeProps).colors.primary : (theme as ThemeProps).colors.text};
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
  text-align: center;
`;

export const SelectButtonContainer = styled.View`
  width: 90%;
  margin-bottom: 40px;
`;

export const ButtonContainer = styled.View`
  width: 50%;
  row-gap: 24px;
`;
