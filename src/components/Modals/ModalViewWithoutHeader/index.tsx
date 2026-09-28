import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Overlay } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from 'styled-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeProps } from '@interfaces/theme';

type Props = BottomSheetProps & {
  children: ReactNode;
  bottomSheetRef?: any;
};

function ModalBackdrop() {
  return <Overlay />;
}

export function ModalViewWithoutHeader({
  children,
  bottomSheetRef = undefined,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;
  const { top } = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      enableContentPanningGesture
      backdropComponent={ModalBackdrop}
      keyboardBehavior='extend'
      topInset={top}
      backgroundComponent={null}
      handleComponent={null}
      style={{ backgroundColor: 'transparent' }}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      {...rest}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          position: 'relative'
        }}
      >

        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Custom handle indicator */}
          <View
            style={{
              width: 48,
              height: 5,
              borderRadius: 3,
              backgroundColor: theme.colors.primary,
            }}
          />
        </View>

        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
