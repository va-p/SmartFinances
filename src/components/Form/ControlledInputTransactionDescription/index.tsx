import React from 'react';
import { TextInputProps } from 'react-native';
import {
  Container,
  ErrorMessage,
  Content,
  Icon,
  Input
} from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

type Props = TextInputProps & {
  name: string;
  control: Control<any>;
  error?: FieldError;
  color: string;
}

export function ControlledInputTransactionDescription({
  name,
  control,
  error,
  color,
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

            <Content>
              <Icon color={color} name='pencil' />
              <Input
                onChangeText={onChange}
                value={value}
                {...rest}
              />
            </Content>
          </>
        )}
      />
    </Container>
  );
}