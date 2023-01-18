import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  Overlay,
  Header,
  Title,
  Container
} from './styles';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export type Props = ModalProps & {
  children: ReactNode;
  closeModal: () => void;
  title: string;
}

export function ModalViewSelection({
  title,
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
        <TouchableWithoutFeedback onPress={closeModal} style={{ width: '100%', height: '100%' }}>
          <>
            <Header>
              <Title>
                {title}
              </Title>
            </Header>

            <Container>
              {children}
            </Container>
          </>
        </TouchableWithoutFeedback>
      </Overlay>
    </Modal >
  );
}