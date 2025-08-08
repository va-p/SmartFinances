import { Button } from './styles';

import Trash from 'phosphor-react-native/src/icons/Trash';

import theme from '@themes/theme';

type Props = {
  handleClickDeleteButton: () => void;
};

export function HeaderDeleteButton({ handleClickDeleteButton }: Props) {
  return (
    <Button onPress={handleClickDeleteButton}>
      <Trash size={24} color={theme.colors.primary} />
    </Button>
  );
}
