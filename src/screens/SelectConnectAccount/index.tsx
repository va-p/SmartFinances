import React, { useState } from 'react';
import {
  Container,
  ButtonGroup,
  ComingSoon
} from './styles';

import { AddAccountButton } from '@components/AddAccountButton';
import { ModalView } from '@components/ModalView';

export function SelectConnectAccount({ navigation }: any) {
  const [connectNubankAccountModalOpen, setConnectNubankAccountModalOpen] = useState(false);

  function handleOpenConnectNubankAccount() {
    setConnectNubankAccountModalOpen(true);
  };

  function handleCloseConnectNubankAccount() {
    setConnectNubankAccountModalOpen(false);
  };

  return (
    <Container>
      <ComingSoon>
        Em breve
      </ComingSoon>

      <ModalView
        visible={connectNubankAccountModalOpen}
        closeModal={handleCloseConnectNubankAccount}
        title='Conectar Conta Nubank'
      >
      </ModalView>
    </Container>
  );
}