import React from 'react';
import { TextInputProps } from 'react-native';
import { Container, ErrorMessage, Input } from './styles';

import { useTheme } from 'styled-components';
import { Control, Controller, FieldError } from 'react-hook-form';

import { ThemeProps } from '@interfaces/theme';

type Props = TextInputProps & {
  name: string;
  control: Control<any>;
  error?: FieldError;
};

export function ControlledInputValue({ name, control, error, ...rest }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <Container>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {error && <ErrorMessage> {error.message} </ErrorMessage>}
            <Input
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.textPlaceholder}
              {...rest}
            />
          </>
        )}
      />
    </Container>
  );
}
