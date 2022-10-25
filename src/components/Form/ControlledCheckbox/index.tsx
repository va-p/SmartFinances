import React from 'react';
import { Container, ErrorMessage } from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

import Checkbox, { CheckboxProps } from 'expo-checkbox';

type Props = CheckboxProps & {
  name: string;
  control: Control<any>;
  error?: FieldError;
}

export function ControlledCheckbox({
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
            {error && <ErrorMessage> {error.message} </ErrorMessage>}

            <Checkbox
              onValueChange={onChange}
              value={value}
              {...rest}
            />
          </>
        )}
      />
    </Container>
  );
}