import React from 'react';
import { Modal } from 'react-native';
import { Backdrop, Card, Title, Message } from './styles';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';

import { Button } from '@components/Button';
import { useBenefits } from '@stores/benefitsStorage';

/**
 * Blocking expiry notice (feature: benefits-tiers). Renders exactly while an
 * expiry notice is PENDING (BEN-41): the consequence text comes from the
 * backend notice (loss of connected-account access, sync stop, image
 * deletion after the grace deadline). "Renew" opens the existing paywall
 * (BEN-43); "Acknowledge" records it and the refetch dismisses the modal
 * (BEN-42).
 */
export function ExpiryNoticeModal() {
  const router = useRouter();
  const notice = useBenefits((state) => state.notice);
  const acknowledgeNotice = useBenefits((state) => state.acknowledgeNotice);

  if (notice?.state !== 'PENDING') {
    return null;
  }

  return (
    <Modal
      transparent
      visible
      animationType='fade'
      onRequestClose={() => undefined}
    >
      <Backdrop>
        <Card testID='expiry-notice-card'>
          <Title>Seu plano não cobre mais seu uso atual</Title>
          <Message>{notice.message}</Message>
          {notice.grace_deadline && (
            <Message testID='expiry-notice-deadline'>
              As imagens acima do limite gratuito serão excluídas em{' '}
              {format(parseISO(notice.grace_deadline), 'dd/MM/yyyy')}.
            </Message>
          )}

          <Button.Root
            type='primary'
            testID='expiry-notice-renew'
            onPress={() => router.navigate('/options/subscription')}
          >
            <Button.Text text='Renovar plano' />
          </Button.Root>

          <Button.Root
            type='secondary'
            testID='expiry-notice-acknowledge'
            onPress={() => acknowledgeNotice()}
          >
            <Button.Text text='Continuar com acesso restrito' />
          </Button.Root>
        </Card>
      </Backdrop>
    </Modal>
  );
}
