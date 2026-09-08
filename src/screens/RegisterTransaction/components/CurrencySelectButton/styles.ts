import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled(RectButton)`
  width: 60px;
  min-height: 25px;
  max-height: 25px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.overlay10};
  border-radius: 15px;
`;

type TitleProps = {
  size?: number;
};
export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme, size }) => (size ? size : (theme as ThemeProps).fonts.sizeTitle)}px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

type IconProps = {
  size?: number;
};
export const Icon = styled(Ionicons)<IconProps>`
  font-size: ${({ size, theme }) => (size ? size : (theme as ThemeProps).fonts.sizeTitle)}px;
  padding-left: 5px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
