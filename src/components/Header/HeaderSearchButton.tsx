import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';

import { ThemeProps } from '@interfaces/theme';

type HeaderSearchButtonProps = {
  onPress: () => void;
};

export function HeaderSearchButton({ onPress }: HeaderSearchButtonProps) {
  const theme = useTheme() as ThemeProps;

  return (
    <Button onPress={onPress}>
      <ButtonShape>
        <MagnifyingGlassIcon size={20} color={theme.colors.primary} />
      </ButtonShape>
    </Button>
  );
}
