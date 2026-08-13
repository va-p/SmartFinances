import React from 'react';
import {
  Container,
  IconContainer,
  TitleContainer,
  Title,
  SubTitle,
} from './styles';

import { useTheme } from 'styled-components';
import { RectButtonProps } from 'react-native-gesture-handler';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

import { ThemeProps } from '@interfaces/theme';

type Props = RectButtonProps & {
  title: string;
  subTitle?: string;
  icon: any;
};

export function SelectButton({ title, subTitle, icon, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container {...rest}>
      <IconContainer>
        {icon}
      </IconContainer>

      <TitleContainer>
        <Title>{title}</Title>
        <SubTitle>{subTitle}</SubTitle>
      </TitleContainer>
    </Container>
  );
}
