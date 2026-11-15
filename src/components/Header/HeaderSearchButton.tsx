import React from 'react';
import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';

import { ThemeProps } from '@interfaces/theme';

type HeaderSearchButtonProps = {
  onPress: () => void;
  testID?: string;
};

export function HeaderSearchButton({
  onPress,
  testID = '',
}: HeaderSearchButtonProps) {
  const theme = useTheme() as ThemeProps;

  return (
    <Button onPress={onPress} testID={testID}>
      <ButtonShape>
        <MagnifyingGlassIcon size={20} color={theme.colors.primary} />
      </ButtonShape>
    </Button>
  );
}
