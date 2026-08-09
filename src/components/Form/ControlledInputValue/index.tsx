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

export function ControlledInputValue({ name, control, error, keyboardType, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <>
            {error && <ErrorMessage> {error.message} </ErrorMessage>}
            <Input
              onChangeText={(text: string) => {
                // iOS decimal-pad may emit a comma as the decimal
                // separator depending on the device region.  Normalize
                // it to a dot so the value stays compatible with the
                // Yup number schema and the database Decimal column.
                onChange(text.replace(',', '.'));
              }}
              value={value}
              keyboardType={keyboardType ?? 'decimal-pad'}
              placeholderTextColor={theme.colors.textPlaceholder}
              {...rest}
            />
          </>
        )}
      />
    </Container>
  );
}
