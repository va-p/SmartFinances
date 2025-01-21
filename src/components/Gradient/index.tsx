import React from 'react';
import { Container } from './styles';

import { LinearGradientProps } from 'expo-linear-gradient';

type Props = LinearGradientProps;

export function Gradient({ ...rest }: Props) {
  return <Container {...rest} />;
}
