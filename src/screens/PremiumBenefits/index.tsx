import React, { useRef } from 'react';
import { Container } from './styles';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { SectionTitle } from '@components/SectionTitle';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { Subscription } from '@screens/Subscription';

export function PremiumBenefits() {
  const subscriptionsBottomSheetRef = useRef<BottomSheetModal>(null);

  function handleOpenSubscriptionsModal() {
    subscriptionsBottomSheetRef.current?.present();
  }

  function handleCloseSubscriptionsModal() {
    subscriptionsBottomSheetRef.current?.dismiss();
  }

  return (
    <Container>
      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Smart Finances Premium'} />
      </Header.Root>

      <SectionTitle title='Benefícios' />

      <Button
        type='secondary'
        title={'Assinar'}
        onPress={handleOpenSubscriptionsModal}
      />

      <ModalView
        bottomSheetRef={subscriptionsBottomSheetRef}
        snapPoints={['100%']}
        enableContentPanningGesture={false}
        closeModal={handleCloseSubscriptionsModal}
        title='Conectar Conta Bancária'
      >
        <Subscription />
      </ModalView>
    </Container>
  );
}
