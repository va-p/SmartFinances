import React, { ElementType } from 'react';
import { Container, ErrorMessage } from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

import { Input, InputProps } from '../Input';

type Props = InputProps & {
  icon?: ElementType;
  name: string;
  control: Control<any>;
  error?: FieldError;
};

export function ControlledInput({
  label,
  icon: Icon,
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

            <Input
              label={label}
              icon={Icon}
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
