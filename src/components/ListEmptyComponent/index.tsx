import React from 'react';
import {
  Container, ListEmptyText
} from './styles';

type Props = {
  text?: string;
}

export function ListEmptyComponent({ text = "Não há transações neste período" }: Props) {
  return (
    <Container>
      <ListEmptyText>
        {text}
      </ListEmptyText>
    </Container>
  );
}