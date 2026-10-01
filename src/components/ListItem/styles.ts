import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

type ItemProps = {
  isActive: boolean;
};

export const Item = styled(RectButton)`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

export const IconsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 8px;
`;

export const Name = styled.Text<ItemProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitle};
  color: ${({ theme, isActive }) =>
    isActive ? (theme as ThemeProps).colors.primary : (theme as ThemeProps).colors.text};
`;
