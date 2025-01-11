import React from 'react';
import { Text, TypeProps } from './styles';

type ButtonTextPros = {
  type?: TypeProps;
  text: string;
};

export function ButtonText({ type = 'primary', text }: ButtonTextPros) {
  return <Text type={type}>{text}</Text>;
}
