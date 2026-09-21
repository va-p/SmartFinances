import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

// NOTE: the repo-wide styled-components DefaultTheme augmentation is broken
// (pre-existing tsc errors in every styles.ts). New files cast the theme to
// ThemeProps per interpolation so they add zero new errors; theme tokens
// missing from ThemeProps (borders, font sizes) are inlined from the theme
// files (borderRadiusShape: 25px, sizeText: 12px).

type AmountProps = { is_amount_reached: boolean };

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 25px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountCurrent = styled.Text<AmountProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  color: ${({ theme, is_amount_reached }) =>
    is_amount_reached
      ? (theme as ThemeProps).colors.success
      : (theme as ThemeProps).colors.primary};
`;

export const AmountText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const AmountTarget = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const FooterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Deadline = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const ReachedBadge = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.success};
`;

export const ReachedBadgeText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.shape};
`;
