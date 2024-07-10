import React from 'react';
import { TextInputProps } from 'react-native';
import { Container, ErrorMessage, Input } from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

type Props = TextInputProps & {
  name: string;
  control: Control<any>;
  error?: FieldError;
};

export function ControlledInputValue({ name, control, error, ...rest }: Props) {
  return (
    <Container>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {error && <ErrorMessage> {error.message} </ErrorMessage>}
            <Input onChangeText={onChange} value={value} {...rest} />
          </>
        )}
      />
    </Container>
  );
}
