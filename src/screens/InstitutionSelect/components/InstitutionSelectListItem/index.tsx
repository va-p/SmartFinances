import React from 'react';
import { Container, Name } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { InstitutionProps } from '@interfaces/institutions';

type Props = RectButtonProps & {
  data: InstitutionProps;
  isChecked: boolean;
};

export function InstitutionSelectListItem({
  data,
  isChecked,
  ...rest
}: Props) {
  return (
    <Container isChecked={isChecked} {...rest}>
      <Name isChecked={isChecked}>{data.name}</Name>
    </Container>
  );
}
