import React, { ReactNode } from 'react';
import { Overlay, Header } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Trash from 'phosphor-react-native/src/icons/Trash';
import { BorderlessButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { top } = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      enablePanDownToClose={true}
      backdropComponent={() => <Overlay />}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      topInset={top}
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
              <Trash color={theme.colors.primary} />
            </BorderlessButton>
          ) : (
            <></>
          )}
        </Header>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
