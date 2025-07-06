import React, { ReactNode } from 'react';
import { Container } from './styles';

import {
  SafeAreaViewProps,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type ScreenProps = SafeAreaViewProps & {
  children: ReactNode;
};

export function Screen({ children, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return <Container {...rest}>{children}</Container>;
}
