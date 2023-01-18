import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  Overlay,
  Container
} from './styles';

export type Props = ModalProps & {
  children: ReactNode;
  closeModal: () => void;
}

export function ModalViewWithoutHeader({
  children,
  closeModal,
  ...rest
}: Props) {
  return (
    <Modal
      transparent
      animationType='slide'
      statusBarTranslucent
      {...rest}
    >
      <Overlay>
        <Container>
          {children}
        </Container>
      </Overlay>
    </Modal>
  );
}