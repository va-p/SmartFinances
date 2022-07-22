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
  const { secondary, secondary_light } = theme.colors;
  return (
    <Container colors={[secondary, secondary_light]}>
      <AvatarImage source={{ uri: urlImage }} />
    </Container>
  );
}

