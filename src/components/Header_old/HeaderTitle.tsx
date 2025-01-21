import React from 'react';
import { TitleContainer, Title, Description } from './styles';

type Props = {
  title: string;
  description?: string | null;
};

export function HeaderTitle({ title, description }: Props) {
  return (
    <TitleContainer>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </TitleContainer>
  );
}
