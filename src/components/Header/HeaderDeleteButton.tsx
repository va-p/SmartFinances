import { Button } from './styles';

import { useTheme } from 'styled-components';

import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  handleClickDeleteButton: () => void;
};

export function HeaderDeleteButton({ handleClickDeleteButton }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Button onPress={handleClickDeleteButton}>
      <TrashIcon size={24} color={theme.colors.primary} />
    </Button>
  );
}
