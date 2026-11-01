import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  padding: 32px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.overlay};
`;

export const Card = styled.View`
  padding: 24px 16px;
  gap: 16px;
  border-radius: ${({ theme }) => (theme as ThemeProps).borders.borderRadiusShape};
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
`;

export const Title = styled.Text`
  text-align: center;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitleXl};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const Message = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
