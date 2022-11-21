import React, { useState } from 'react';
import {
  Container,
  ButtonGroup
} from './styles';

import { AddAccountButton } from '@components/AddAccountButton';
import { ModalView } from '@components/ModalView';

import { ConnectNubankAccount } from '@screens/ConnectNubankAccount';

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
      <ButtonGroup>

      </ButtonGroup>

      <ButtonGroup>

      </ButtonGroup>

      <ModalView
        visible={connectNubankAccountModalOpen}
        closeModal={handleCloseConnectNubankAccount}
        title='Conectar Conta Nubank'
      >
        <ConnectNubankAccount />
      </ModalView>
    </Container>
  );
}