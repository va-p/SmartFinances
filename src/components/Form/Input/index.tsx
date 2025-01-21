import React, { ElementType } from 'react';
import { TextInputProps } from 'react-native';
import { Label, Container, InputText } from './styles';

export type InputProps = TextInputProps & {
  icon?: ElementType;
  label?: string;
};

export function Input({ icon: Icon, label, ...rest }: InputProps) {
  return (
    <>
      {label && <Label> {label} </Label>}
      <Container>
        <InputText {...rest} />
        {Icon && <Icon />}
      </Container>
    </>
  );
}
