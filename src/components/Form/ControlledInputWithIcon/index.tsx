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
  icon: string;
  color: string;
  name: string;
  control: Control<any>;
  error?: FieldError;
}

export function ControlledInputWithIcon({
  icon,
  color,
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
              <Icon color={color} name={icon} />
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