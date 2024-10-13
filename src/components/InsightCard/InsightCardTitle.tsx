import React from 'react';
import { TitleContainer, InsightTitle, InsightText } from './styles';

type Props = {
  title?: string;
  text?: string | null;
};

export function InsightCardTitle({ title, text }: Props) {
  return (
    <TitleContainer>
      {title && <InsightTitle>{title}</InsightTitle>}
      {text && <InsightText>{text}</InsightText>}
    </TitleContainer>
  );
}
