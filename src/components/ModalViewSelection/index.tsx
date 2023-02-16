import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Overlay,
  Title,
  Container
} from './styles';

import { BottomSheetProps, BottomSheetModal } from '@gorhom/bottom-sheet';

import theme from '@themes/theme';

export type Props = BottomSheetProps & {
  title: string;
  bottomSheetRef?: any;
  children: ReactNode;
}

export function ModalViewSelection({ title, bottomSheetRef, children, ...rest }: Props) {
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
        <Title>
          {title}
        </Title>

        <Container>
          {children}
        </Container>
      </SafeAreaView>
    </BottomSheetModal>
  );
}