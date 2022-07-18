import React from 'react';
import {
  Container,
  AvatarImage
} from './styles';

import theme from '@themes/theme';

type Props = {
  urlImage: string;
}

export function Avatar({ urlImage }: Props) {
  const { primary, secondary } = theme.colors;
  return (
    <Container colors={[primary, secondary]}>
      <AvatarImage source={{ uri: urlImage }} />
    </Container>
  );
}

