import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  Overlay,
  Container
} from './styles';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type Props = ModalProps & {
  children: ReactNode;
  closeModal: () => void;
}

export function ModalViewRegisterTransaction({
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
      <GestureHandlerRootView style={{ width: '100%', height: '100%' }}>
        <Overlay>
          <Container>
            {children}
          </Container>
        </Overlay>
      </GestureHandlerRootView>
    </Modal>
  );
}