import React from 'react';
import { TextInputProps } from 'react-native';
import { Container, ErrorMessage, Input } from './styles';

import { useTheme } from 'styled-components';
import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { ThemeProps } from '@interfaces/theme';
import { parseDecimalInput } from '@utils/parseDecimalInput';

type Props<TFieldValues extends FieldValues = FieldValues> =
  TextInputProps & {
    name: FieldPath<TFieldValues>;
    control: Control<TFieldValues>;
    error?: FieldError;
  };

export function ControlledInputValue<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  error = undefined,
  keyboardType,
  ...rest
}: Props<TFieldValues>) {
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
                onChange(parseDecimalInput(text));
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
