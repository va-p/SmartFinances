import { Button, ButtonShape } from './styles';

import X from 'phosphor-react-native/src/icons/X';

import theme from '@themes/theme';

type Props = {
  handleClickCloseButton: () => void;
};

export function HeaderCloseButton({ handleClickCloseButton }: Props) {
  return (
    <Button onPress={handleClickCloseButton}>
      <ButtonShape>
        <X size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
