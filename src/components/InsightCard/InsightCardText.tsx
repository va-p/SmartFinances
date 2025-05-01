import React from 'react';
import { TitleContainer, InsightText } from './styles';

type Props = {
  description: string;
};

export function InsightCardDescription({ description }: Props) {
  return (
    <TitleContainer>
      <InsightText>{description}</InsightText>
    </TitleContainer>
  );
}
