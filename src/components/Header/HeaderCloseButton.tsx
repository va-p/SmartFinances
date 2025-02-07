import { Button, ButtonShape } from './styles';

import * as Icon from 'phosphor-react-native';

import theme from '@themes/theme';

type Props = {
  handleClickCloseButton: () => void;
};

export function HeaderCloseButton({ handleClickCloseButton }: Props) {
  return (
    <Button onPress={handleClickCloseButton}>
      <ButtonShape>
        <Icon.X size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
