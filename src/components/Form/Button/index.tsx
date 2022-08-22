import React from 'react';

import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Title, Load, TypeProps } from './styles';

type Props = RectButtonProps & {
  type?: TypeProps;
  title: string;
  isLoading?: boolean;
}

export function Button({
  type = 'primary',
  title,
  isLoading = false,
  ...rest
}: Props) {
  return (
    <Container {...rest} type={type} enabled={!isLoading}>
      {isLoading ? <Load type={type} /> : <Title type={type}>{title}</Title>}
    </Container>
  );
}