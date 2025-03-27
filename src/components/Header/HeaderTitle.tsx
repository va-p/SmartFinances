import React from 'react';
import { TextProps } from 'react-native';
import { TitleContainer, Title, Description } from './styles';

type Props = TextProps & {
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
