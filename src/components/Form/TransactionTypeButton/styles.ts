import styled, { css } from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

export type TransactionTypeProps = 'up' | 'down' | 'swap';

type ContainerProps = {
  isActive: boolean;
  type: TransactionTypeProps;
};

export const Container = styled.View<ContainerProps>`
  width: 32%;
  border-width: ${({ isActive }) => (isActive ? 0 : 1.5)}px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 5px;

  ${({ isActive, type }) =>
    isActive &&
    type === 'down' &&
    css`
      background-color: ${({ theme }) => theme.colors.success_light};
    `};
  ${({ isActive, type }) =>
    isActive &&
    type === 'up' &&
    css`
      background-color: ${({ theme }) => theme.colors.attention_light};
    `};
  ${({ isActive, type }) =>
    isActive &&
    type === 'swap' &&
    css`
      background-color: ${({ theme }) => theme.colors.text_light};
    `};
`;

export const Button = styled(RectButton)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
`;

export const Icon = styled(Ionicons)<ContainerProps>`
  font-size: ${RFValue(24)}px;
  margin-right: 5px;
  ${({ type }) =>
    type === 'down' &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `};
  ${({ type }) =>
    type === 'up' &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `};
  ${({ type }) =>
    type === 'swap' &&
    css`
      color: ${({ theme }) => theme.colors.text};
    `};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;
