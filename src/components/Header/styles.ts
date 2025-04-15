import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

type ContainerProps = {
  isSingleChild?: boolean;
  childsCount: number;
};

export const Container = styled.View<ContainerProps>`
  width: 100%;
  flex-direction: row;
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

export const Button = styled(BorderlessButton)`
  color: ${({ theme }) => theme.colors.primary};
`;

export const ButtonShape = styled.View`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const TitleContainer = styled.View``;

export const Title = styled.Text.attrs({
  numberOfLines: 2,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditButton = styled(BorderlessButton)``;
