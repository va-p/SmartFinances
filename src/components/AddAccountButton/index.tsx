import React from 'react';
import {
  Container,
  Icon,
  Title
} from './styles';
import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  icon?: string;
  urlImage?: string;  
  title: string;
}

export function AddAccountButton({ icon = undefined, title, ...rest }: Props) {
  return (
    <Container {...rest}>
      <Icon name={icon}/>
      <Title>{title}</Title>
    </Container>
  );
}