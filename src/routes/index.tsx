import React from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';

import { AuthRoutes } from './auth.stack.routes';

export function Routes() {
  return (
    <NavigationContainer>
      <BottomSheetModalProvider>
        <AuthRoutes />
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}