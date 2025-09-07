import React from 'react';
import {
  Container,
  TitleContainer,
  Title,
  SubtitleContainer,
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
  const theme: ThemeProps = useTheme();

  return (
    <Container {...rest}>
      <TitleContainer>
        {icon}
        <Title>{title}</Title>
      </TitleContainer>
      <SubtitleContainer>
        <SubTitle>{subTitle}</SubTitle>
        <CaretRight size={16} color={theme.colors.text} />
      </SubtitleContainer>
    </Container>
  );
}
