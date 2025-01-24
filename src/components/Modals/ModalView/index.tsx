import React, { ReactNode } from 'react';
import { Overlay, Header, Title, Container } from './styles';

import {
  BottomSheetProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Icon from 'phosphor-react-native';
import { BorderlessButton } from 'react-native-gesture-handler';

import theme from '@themes/theme';

type TypeProps = 'primary' | 'secondary';

export type Props = BottomSheetProps & {
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
          <BorderlessButton onPress={closeModal}>
            <Icon.X color={theme.colors.primary} style={{ marginLeft: 12 }} />
          </BorderlessButton>
          <Title>
            {title} {selectedIdentification}
          </Title>

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
