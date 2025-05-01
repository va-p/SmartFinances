import React from 'react';
import { TitleContainer, InsightTitle } from './styles';

type Props = {
  title: string;
};

export function InsightCardTitle({ title }: Props) {
  return (
    <TitleContainer>
      <InsightTitle>{title}</InsightTitle>
    </TitleContainer>
  );
}
