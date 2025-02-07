import React, { ReactNode } from 'react';
import { Overlay, Header, Container } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Icon from 'phosphor-react-native';
import { BorderlessButton } from 'react-native-gesture-handler';

import { Header as HeaderComponent } from '@components/Header';

import theme from '@themes/theme';

type TypeProps = 'primary' | 'secondary';

type Props = BottomSheetProps & {
  type?: TypeProps;
  title: string;
  color?: string;
  selectedIdentification?: string;
  children: ReactNode;
  bottomSheetRef?: any;
  closeModal: () => void;
  deleteChildren?: () => void;
};

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
      <BottomSheetView style={{ flex: 1 }}>
        <Header color={color}>
          <HeaderComponent.Root>
            <HeaderComponent.CloseButton handleClickCloseButton={closeModal} />
            <HeaderComponent.Title title={`${title}`} />
          </HeaderComponent.Root>

          {type === 'secondary' ? (
            <BorderlessButton onPress={deleteChildren}>
              <Icon.Trash color={theme.colors.primary} />
            </BorderlessButton>
          ) : (
            <></>
          )}
        </Header>

        <Container>{children}</Container>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
