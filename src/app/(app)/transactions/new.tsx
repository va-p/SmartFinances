import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { RegisterTransaction } from '@screens/RegisterTransaction';
import { Screen } from '@components/Screen';

function noop() {
  // Create mode has no selection to reset.
}

// Cold-start target for the home-screen widget "+" buttons
// (`com.vap.smartfinances://transactions/new`). Reuses the create-mode
// transaction form; closing returns to the previous screen or Home.
export default function NewTransactionScreen() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)');
    }
  }, [router]);

  return (
    <Screen>
      <RegisterTransaction
        id=''
        resetId={noop}
        closeRegisterTransaction={handleClose}
      />
    </Screen>
  );
}
