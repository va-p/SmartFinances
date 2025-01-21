import React from 'react';
import { Container, Line, Text } from './styles';

type Props = {
  text: string;
};

export function ScreenDivider({ text }: Props) {
  return (
    <Container>
      <Line />
      <Text>{text}</Text>
      <Line />
    </Container>
  );
}
