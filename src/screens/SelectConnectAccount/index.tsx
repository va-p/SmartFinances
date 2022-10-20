import React from 'react';
import {
  Container,
  ButtonGroup
} from './styles';

import { AddAccountButton } from '@components/AddAccountButton';

export function SelectConnectAccount({ navigation }: any) {
  return (
    <Container>
      <ButtonGroup>
        <AddAccountButton
          icon='card'
          title='nubank'
        />
      </ButtonGroup>

      <ButtonGroup>       
      </ButtonGroup>
    </Container>
  );
}