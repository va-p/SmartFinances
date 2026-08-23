import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';

type CircleProps = {
  size: number;
  backgroundColor: string;
};

export const AvatarWrapper = styled.View`
  margin-right: 12px;
`;

export const AvatarCircle = styled.View<CircleProps>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size / 2}px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  align-items: center;
  justify-content: center;
`;

type IconProps = {
  size?: number;
};

export const CategoryIcon = styled(Ionicons)<IconProps>`
  font-size: ${({ size, theme }) => (size ? size : theme.fonts.sizeTitle)}px;
  color: ${({ color }) => color};
`;

export const FallbackLetter = styled.Text<{ size: number }>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ size }) => size * 0.45}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const StatusBadge = styled.View`
  position: absolute;
  right: 6px;
  bottom: -2px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: ${({ theme }) => theme.colors.backgroundNav};
  align-items: center;
  justify-content: center;
`;
