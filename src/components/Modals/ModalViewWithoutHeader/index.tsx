import React, { ReactNode } from 'react';
import { Overlay, Container } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import theme from '@themes/theme';

export type Props = BottomSheetProps & {
  children: ReactNode;
  bottomSheetRef?: any;
};

export function ModalViewWithoutHeader({
  children,
  bottomSheetRef,
  ...rest
}: Props) {
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      enableContentPanningGesture={false}
      backdropComponent={() => <Overlay />}
      backgroundStyle={{ display: 'none' }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      {...rest}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <Container>{children}</Container>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
