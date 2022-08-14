import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  Overlay,
  Header,
  Title,
  Container
} from './styles';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type Props = ModalProps & {
  children: ReactNode;
  closeModal: () => void;
  title: string;
}

export function ModalViewSelection({
  children,
  closeModal,
  title,
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
          <Header>
            <Title>
              {title}
            </Title>
          </Header>

          <Container>
            {children}
          </Container>
        </Overlay>
      </GestureHandlerRootView>
    </Modal>
  );
}