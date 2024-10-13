import React, { ReactNode } from 'react';
import { Container } from './styles';

type InsightCardRootProps = {
  children: ReactNode;
};

export function InsightCardRoot({ children }: InsightCardRootProps) {
  return <Container>{children}</Container>;
}
