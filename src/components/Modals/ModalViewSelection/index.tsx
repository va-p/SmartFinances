import React, { ReactNode } from 'react';
import { Overlay, Title, Container } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Gradient } from '@components/Gradient';

import theme from '@themes/theme';

type Props = BottomSheetProps & {
  title: string;
  bottomSheetRef?: any;
  children: ReactNode;
};

export function ModalViewSelection({
  title,
  bottomSheetRef,
  children,
  ...rest
}: Props) {
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      stackBehavior='push'
      maxDynamicContentSize={400}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      backdropComponent={() => <Overlay />}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      backgroundComponent={() => <Gradient />}
      handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      {...rest}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <Title>{title}</Title>

        <Container>{children}</Container>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
