import React, { ReactNode } from 'react';
import { Overlay } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '@themes/theme';

type Props = BottomSheetProps & {
  children: ReactNode;
  bottomSheetRef?: any;
};

export function ModalViewWithoutHeader({
  children,
  bottomSheetRef,
  ...rest
}: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      enableContentPanningGesture={false}
      backdropComponent={() => <Overlay />}
      backgroundStyle={{ display: 'none' }}
      handleStyle={{
        paddingBottom: 0,
        marginBottom: -12,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      topInset={top}
      {...rest}
    >
      <BottomSheetView
        style={{
          flex: 1,
          overflow: 'hidden',
          borderTopLeftRadius: 80,
          borderTopRightRadius: 80,
        }}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
