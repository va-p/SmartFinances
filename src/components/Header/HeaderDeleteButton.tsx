import { Button } from './styles';

import { useTheme } from 'styled-components';

import Trash from 'phosphor-react-native/src/icons/Trash';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  handleClickDeleteButton: () => void;
};

export function HeaderDeleteButton({ handleClickDeleteButton }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <Button onPress={handleClickDeleteButton}>
      <Trash size={24} color={theme.colors.primary} />
    </Button>
  );
}
