import React, { ReactNode } from 'react';
import { Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import { Container } from './styles';

import {
  SafeAreaViewProps,
} from 'react-native-safe-area-context';

type ScreenProps = SafeAreaViewProps & {
  children: ReactNode;
};

export function Screen({ children, ...rest }: ScreenProps) {
  // On iOS with NativeTabs, the tab bar controller handles bottom safe area
  // natively. Exclude bottom edge to avoid a dead zone behind the Liquid Glass.
  const edges = Platform.OS === 'ios'
    ? (['top', 'left', 'right'] as const)
    : undefined;

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      style={{ flex: 1 }}
    >
      <Container edges={edges} {...rest}>{children}</Container>
    </TouchableWithoutFeedback>
  );
}
