import { EditButton } from './styles';

import { useTheme } from 'styled-components';

import { DotsThreeCircleIcon } from 'phosphor-react-native/src/icons/DotsThreeCircle';

import { ThemeProps } from '@interfaces/theme';

type HeaderIconProps = {
  onPress: () => void;
};

export function HeaderIcon({ onPress }: HeaderIconProps) {
  const theme = useTheme() as ThemeProps;

  return (
    <EditButton onPress={onPress}>
      <DotsThreeCircleIcon size={20} color={theme.colors.primary} />
    </EditButton>
  );
}
