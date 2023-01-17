import React, { ReactNode } from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  Overlay,
  Header,
  Icon,
  Title,
  Container
} from './styles';

import { BorderlessButton, GestureHandlerRootView } from 'react-native-gesture-handler';

import theme from '@themes/theme';

type TypeProps = 'primary' | 'secondary';

export type Props = ModalProps & {
  type?: TypeProps;
  title: string;
  color?: string;
  selectedIdentification?: string;
  children: ReactNode;
  closeModal: () => void;
  deleteChildren?: () => void;
}

export function ModalView({
  type = 'primary',
  title,
  color = theme.colors.background,
  selectedIdentification,
  children,
  closeModal,
  deleteChildren,
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
          <Header color={color}>
            <BorderlessButton onPress={closeModal} style={{ position: 'absolute', top: 10, left: 25 }}>
              <Icon name='close' />
            </BorderlessButton>
            <Title>
              {title} {selectedIdentification}
            </Title>

            {
              type === 'secondary' ?
                <BorderlessButton onPress={deleteChildren} style={{ position: 'absolute', top: 10, right: 25 }}>
                  <Icon name='trash-outline' />
                </BorderlessButton> :
                <></>
            }
          </Header>

          <Container>
            {children}
          </Container>
        </Overlay>
      </GestureHandlerRootView>
    </Modal>
  );
}