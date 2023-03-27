import React from 'react';
import { TextInputProps } from 'react-native';
import { Container, ErrorMessage, Content, Input } from './styles';

import { Control, Controller, FieldError } from 'react-hook-form';

type Props = TextInputProps & {
  icon: any;
  name: string;
  control: Control<any>;
  error?: FieldError;
};

export function ControlledInputWithIcon({
  icon,
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

            <Content>
              <>{icon}</>
              <Input onChangeText={onChange} value={value} {...rest} />
            </Content>
          </>
        )}
      />
    </Container>
  );
}
