import React, { ReactNode } from 'react';
import { Container } from './styles';

type HeaderRootProps = {
  children: ReactNode;
};

export function HeaderRoot({ children }: HeaderRootProps) {
  return <Container>{children}</Container>;
}
