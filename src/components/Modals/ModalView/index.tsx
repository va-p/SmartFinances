import React, { ReactNode } from 'react';
import { Overlay, Header } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradient } from '@components/Gradient';
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
      backgroundComponent={() => <Gradient />}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      topInset={top}
      {...rest}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <Header>
          <HeaderComponent.Root>
            <HeaderComponent.CloseButton handleClickCloseButton={closeModal} />
            <HeaderComponent.Title title={`${title}`} />
            {type === 'secondary' && (
              <HeaderComponent.DeleteButton
                handleClickDeleteButton={deleteChildren!}
              />
            )}
          </HeaderComponent.Root>
        </Header>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
