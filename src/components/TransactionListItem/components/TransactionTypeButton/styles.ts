import styled from 'styled-components/native';

import { css } from 'styled-components';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';

export type TransactionTypeProps = 'down' | 'swap' | 'up';

type ButtonProps = {
  isActive: boolean;
  type: TransactionTypeProps;
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

export const Button = styled.Pressable`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 72px;
`;

export const Icon = styled(Ionicons)<ButtonProps>`
  font-size: ${RFValue(20)}px;
  margin-right: 5px;

  ${({ isActive, type }) =>
    isActive &&
    type === 'down' &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `};
  ${({ isActive, type }) =>
    isActive &&
    type === 'swap' &&
    css`
      color: ${({ theme }) => theme.colors.border};
    `};
  ${({ isActive, type }) =>
    isActive &&
    type === 'up' &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  align-self: center;
  color: ${({ theme }) => theme.colors.text};
`;
