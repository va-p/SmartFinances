import React from 'react';
import {
  Container,
  IconAndTextsContainer,
  IconContainer,
  TitleContainer,
  Title,
  SubTitle,
} from './styles';

import { useTheme } from 'styled-components';
import { RectButtonProps } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';

type Props = RectButtonProps & {
  title: string;
  subTitle?: string;
  icon: any;
};

export function SelectButton({ title, subTitle, icon, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container {...rest}>
      <IconAndTextsContainer>
      <IconContainer>
        {icon}
      </IconContainer>

      <TitleContainer>
        <Title>{title}</Title>
        {subTitle && <SubTitle>{subTitle}</SubTitle>}
      </TitleContainer>
      </IconAndTextsContainer>

      <CaretRightIcon size={16} color={theme.colors.text} />
    </Container>
  );
}
