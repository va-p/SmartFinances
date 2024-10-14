import React from 'react';
import { Container } from './styles';

import { Header } from '@components/Header';

export function HelpCenter() {
  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title='Central de Ajuda' />
      </Header.Root>
    </Container>
  );
}
