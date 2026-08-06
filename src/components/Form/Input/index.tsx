import React, { ElementType } from 'react';
import { TextInputProps } from 'react-native';
import { Label, Container, InputText } from './styles';

import { useTheme } from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export type InputProps = TextInputProps & {
  icon?: ElementType;
  label?: string;
};

export function Input({ icon: Icon, label, ...rest }: InputProps) {
  const theme = useTheme() as ThemeProps;

  return (
    <>
      {label && <Label> {label} </Label>}
      <Container>
        <InputText {...rest} />
        {Icon && <Icon color={theme.colors.textPlaceholder} />}
      </Container>
    </>
  );
}
