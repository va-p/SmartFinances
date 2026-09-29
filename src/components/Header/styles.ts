import styled, { css } from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';
import { ThemeProps } from '@interfaces/theme';

type ContainerProps = {
  childsCount: number;
};

export const Container = styled.View<ContainerProps>`
  width: 100%;
  flex-direction: row;
  padding-bottom: 8px;
  column-gap: 16px;

  ${({ childsCount }) =>
    childsCount === 1 &&
    css`
      justify-content: center;
    `};

  ${({ childsCount }) =>
    childsCount === 2 &&
    css`
      justify-content: flex-start;
    `};

  ${({ childsCount }) =>
    childsCount >= 3 &&
    css`
      justify-content: space-between;
    `};
`;

export const Button = styled(BorderlessButton)``;

export const ButtonShape = styled.View`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;

export const TitleContainer = styled.View`
  max-width: 84%;
`;

export const Title = styled.Text.attrs({
  numberOfLines: 2,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitleXl};
  text-align: center;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  text-align: center;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const EditButton = styled(BorderlessButton)``;
