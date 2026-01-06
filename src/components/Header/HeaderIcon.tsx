import { EditButton } from './styles';

import { useTheme } from 'styled-components';

import DotsThreeCircle from 'phosphor-react-native/src/icons/DotsThreeCircle';

import { ThemeProps } from '@interfaces/theme';

type HeaderIconProps = {
  onPress: () => void;
};

export function HeaderIcon({ onPress }: HeaderIconProps) {
  const theme: ThemeProps = useTheme();

  return (
    <EditButton onPress={onPress}>
      <DotsThreeCircle size={20} color={theme.colors.primary} />
    </EditButton>
  );
}
