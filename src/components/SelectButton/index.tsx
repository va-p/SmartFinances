import React from 'react';
import {
  Container,
  IconAndTextsContainer,
  IconContainer,
  TitleContainer,
  Title,
  SubTitle,
  CaretAndAltButtonGroup,
} from './styles';

import {
  BorderlessButton,
  RectButtonProps,
} from 'react-native-gesture-handler';
import { useTheme } from 'styled-components';

import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';

import { ThemeProps } from '@interfaces/theme';

type Props = RectButtonProps & {
  title: string;
  subTitle?: string;
  icon: any;
  altButton?: {
    onPress: () => void;
    icon: any;
  };
};

export function SelectButton({
  title,
  subTitle = undefined,
  icon,
  altButton = undefined,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container {...rest}>
      <IconAndTextsContainer>
        <IconContainer>{icon}</IconContainer>

        <TitleContainer>
          <Title>{title}</Title>
          {subTitle && <SubTitle>{subTitle}</SubTitle>}
        </TitleContainer>
      </IconAndTextsContainer>

      <CaretAndAltButtonGroup>
        {altButton && (
          <BorderlessButton
            onPress={altButton.onPress}
            style={{ marginLeft: 8 }}
          >
            {altButton.icon}
          </BorderlessButton>
        )}

        <CaretRightIcon size={16} color={theme.colors.text} />
      </CaretAndAltButtonGroup>
    </Container>
  );
}
