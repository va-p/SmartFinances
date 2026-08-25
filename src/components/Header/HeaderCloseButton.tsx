import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';

import { XIcon } from 'phosphor-react-native/src/icons/X';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  handleClickCloseButton: () => void;
};

export function HeaderCloseButton({ handleClickCloseButton }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Button onPress={handleClickCloseButton}>
      <ButtonShape>
        <XIcon size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
