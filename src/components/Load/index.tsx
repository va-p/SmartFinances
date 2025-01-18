import React from 'react';
import { Container, Indicator } from './styles';

import { TypeProps } from '@components/Button/styles';

type Props = {
  type: TypeProps;
};
export function Load({ type }: Props) {
  return (
    <Container>
      <Indicator size='large' type={type} />
    </Container>
  );
}
