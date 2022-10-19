import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import {
  Container,
  Icon,
  Title
} from './styles';

type Props = RectButtonProps & {
  icon?: string;
  urlImage?: string;  
  title: string;
}

export function AddAccountButton({ icon, title, ...rest }: Props) {
  return (
    <Container {...rest}>
      <Icon name={icon}/>
      <Title>{title}</Title>
    </Container>
  );
}