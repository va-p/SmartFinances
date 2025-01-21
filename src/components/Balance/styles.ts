import styled, { css } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

interface TypeProps {
  type: 'up' | 'down' | 'total';
}

export const Container = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const Icon = styled(Ionicons)<TypeProps>`
  font-size: ${({ type }) => (type === 'total' ? '0' : '40px')};
  padding-right: ${({ type }) => (type === 'total' ? '0' : '10px')};

  ${({ type }) =>
    type === 'up' &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `};

  ${({ type }) =>
    type === 'down' &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `};

  ${({ type }) =>
    type === 'total' &&
    css`
      color: ${({ theme }) => theme.colors.shape};
    `};
`;

export const Details = styled.View<TypeProps>`
  ${({ type }) =>
    type === 'total' &&
    css`
      align-items: center;
    `};
`;

export const TitleBalance = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountBalance = styled.Text<TypeProps>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ type }) => (type === 'total' ? '20px' : '16px')};

  ${({ type }) =>
    type === 'up' &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `}

  ${({ type }) =>
    type === 'down' &&
    css`
      color: ${({ theme }) => theme.colors.attention};
    `}

  ${({ type }) =>
    type === 'total' &&
    css`
      color: ${({ theme }) => theme.colors.text};
    `}
`;
