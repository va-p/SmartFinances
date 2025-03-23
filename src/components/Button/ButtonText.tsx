import React from 'react';
import { Text } from './styles';

type ButtonTextPros = {
  text: string;
};

export function ButtonText({ text }: ButtonTextPros) {
  return <Text>{text}</Text>;
}
