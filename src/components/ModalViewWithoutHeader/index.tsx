import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native';
import { Overlay, Container } from './styles';

import { BottomSheetProps, BottomSheetModal } from '@gorhom/bottom-sheet';
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
      <SafeAreaView style={{ flex: 1 }}>
        <Container>{children}</Container>
      </SafeAreaView>
    </BottomSheetModal>
  );
}
