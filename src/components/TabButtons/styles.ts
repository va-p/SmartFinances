import styled from 'styled-components/native';

import { css } from 'styled-components';
import Animated from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';

type ButtonProps = {
  isActive: boolean;
  isPositive?: boolean;
};

export const Container = styled.View`
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 16px;
`;

export const AnimatedButton = styled(Animated.View)`
  position: absolute;
  margin-left: 5px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const ButtonsContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.overlayGray};
  border-radius: 10px;
`;

export const Button = styled.Pressable<ButtonProps>`
  flex: 1;
  padding: 14px 0;
`;

export const Title = styled.Text<ButtonProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  align-self: center;

  ${({ isActive, isPositive }) =>
    isActive &&
    isPositive &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `};

  ${({ isActive, isPositive }) =>
    isActive &&
    !isPositive &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `};

  ${({ isActive }) =>
    !isActive &&
    css`
      color: ${({ theme }) => theme.colors.text};
    `};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  align-self: center;
  color: ${({ theme }) => theme.colors.text};
`;
