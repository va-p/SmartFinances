import React from 'react';
import {
  Container,
  Title,
  Icon
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  title: string;
}

export function SelectButton({ title, ...rest }: Props) {
  return (
    <Container {...rest}>
      <Title>{title}</Title>
      <Icon name='chevron-down-outline' />
    </Container>
  );
}