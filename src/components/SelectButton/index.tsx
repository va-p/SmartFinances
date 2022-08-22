import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import {
  Container,
  Icon,
  TitleContainer,
  Title,
  SubtitleContainer,
  SubTitle,
  IconChevronDown
} from './styles';

type Props = RectButtonProps & {
  title: string;
  subTitle?: string;
  icon: string;
  color: string;
}

export function SelectButton({
  title,
  subTitle,
  icon,
  color,
  ...rest
}: Props) {
  return (
    <Container {...rest}>
      <TitleContainer>
        <Icon color={color} name={icon} />
        <Title>{title}</Title>
      </TitleContainer>
      <SubtitleContainer>
        <SubTitle>{subTitle}</SubTitle>
        <IconChevronDown name='chevron-forward-outline' />
      </SubtitleContainer>
    </Container>
  )
}