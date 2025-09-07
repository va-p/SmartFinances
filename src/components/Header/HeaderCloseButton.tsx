import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';

import X from 'phosphor-react-native/src/icons/X';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  handleClickCloseButton: () => void;
};

export function HeaderCloseButton({ handleClickCloseButton }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <Button onPress={handleClickCloseButton}>
      <ButtonShape>
        <X size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
