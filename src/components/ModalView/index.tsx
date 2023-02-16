import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Overlay,
  Header,
  Icon,
  Title,
  Container
} from './styles';

import { BottomSheetProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import { BorderlessButton } from 'react-native-gesture-handler';

import theme from '@themes/theme';

type TypeProps = 'primary' | 'secondary';

export type Props = BottomSheetProps & {
  type?: TypeProps;
  title: string;
  color?: string;
  selectedIdentification?: string;
  children: ReactNode;
  bottomSheetRef?: any;
  closeModal: () => void;
  deleteChildren?: () => void;
}

export function ModalView({
  type = 'primary',
  title,
  color = theme.colors.background,
  selectedIdentification,
  children,
  bottomSheetRef,
  closeModal,
  deleteChildren,
  ...rest
}: Props) {
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      enablePanDownToClose={true}
      backdropComponent={() => <Overlay />}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      {...rest}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header color={color}>
          <BorderlessButton onPress={closeModal} >
            <Icon name='close' />
          </BorderlessButton>
          <Title>
            {title} {selectedIdentification}
          </Title>

          {
            type === 'secondary' ?
              <BorderlessButton onPress={deleteChildren}>
                <Icon name='trash-outline' />
              </BorderlessButton> :
              <></>
          }
        </Header>

        <Container>
          {children}
        </Container>
      </SafeAreaView>
    </BottomSheetModal>
  );
}