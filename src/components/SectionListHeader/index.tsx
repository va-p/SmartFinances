import React from 'react';
import { Container, SectionText } from './styles';

interface SectionHeaderProps {
  title: string;
  total: string;
}

type Props = {
  data: SectionHeaderProps;
};

export function SectionListHeader({ data }: Props) {
  return (
    <Container>
      <SectionText>{data.title}</SectionText>
      <SectionText>{data.total}</SectionText>
    </Container>
  );
}
