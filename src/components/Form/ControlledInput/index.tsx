import React from 'react';
import { Container, ErrorMessage } from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

import { Input, InputProps } from '../Input';

type Props = InputProps & {
  name: string;
  control: Control<any>;
  error?: FieldError;
}

export function ControlledInput({
  type,
  label,
  name,
  control,
  error,
  ...rest
}: Props) {
  return (
    <Container>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {error && <ErrorMessage type={type}> {error.message} </ErrorMessage>}

            <Input
              type={type}
              label={label}
              onChangeText={onChange}
              value={value}
              {...rest}
            />
          </>
        )}
      />
    </Container>
  );
}