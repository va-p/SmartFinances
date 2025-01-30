import React, { ReactNode } from 'react';
import { Container, TypeProps } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { Load } from '@components/Button/components/Load';

type ButtonRootProps = RectButtonProps & {
  children: ReactNode;
  type?: TypeProps;
  isLoading?: boolean;
};

export function ButtonRoot({
  children,
  type = 'primary',
  isLoading,
  ...rest
}: ButtonRootProps) {
  return (
    <Container type={type} enabled={!isLoading} {...rest}>
      {isLoading ? <Load type={type} /> : children}
    </Container>
  );
}
