import React from 'react';
import { TextInputProps } from 'react-native';
import { Label, Container, TypeProps } from './styles';

export type InputProps = TextInputProps & {
  type: TypeProps;
  label?: string;
};

export function Input({ type = 'primary', label, ...rest }: InputProps) {
  return (
    <>
      {label && <Label type={type}> {label} </Label>}
      <Container type={type} {...rest} />
    </>
  );
}
