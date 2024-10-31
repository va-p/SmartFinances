import React from 'react';

import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Text, Load, TypeProps } from './styles';

type Props = RectButtonProps & {
  type?: TypeProps;
  title: string;
  isLoading?: boolean;
};

export function Button({
  type = 'primary',
  title,
  isLoading = false,
  ...rest
}: Props) {
  return (
    <Container type={type} enabled={!isLoading} {...rest}>
      {isLoading ? <Load type={type} /> : <Text type={type}>{title}</Text>}
    </Container>
  );
}
