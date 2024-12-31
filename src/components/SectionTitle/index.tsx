import React from 'react';
import { Title } from './styles';

type Props = {
  title: string;
};

export function SectionTitle({ title }: Props) {
  return <Title>{title}</Title>;
}
