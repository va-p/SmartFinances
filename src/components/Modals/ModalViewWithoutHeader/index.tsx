import React, { ReactNode } from 'react';
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

export function ModalViewWithoutHeader({
  children,
  bottomSheetRef,
  ...rest
}: Props) {
  const theme: ThemeProps = useTheme();
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
          borderTopLeftRadius: 75,
          borderTopRightRadius: 75,
        }}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
