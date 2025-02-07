import React, { ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Container } from './styles';

type HeaderRootProps = ViewProps & {
  children: ReactNode;
};

export function HeaderRoot({ children, ...rest }: HeaderRootProps) {
  return <Container {...rest}>{children}</Container>;
}
