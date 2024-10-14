import { EditButton } from './styles';

import { DotsThreeCircle } from 'phosphor-react-native';

type HeaderIconProps = {
  onPress: () => void;
};

import theme from '@themes/theme';

export function HeaderIcon({ onPress }: HeaderIconProps) {
  return (
    <EditButton onPress={onPress}>
      <DotsThreeCircle size={20} color={theme.colors.primary} />
    </EditButton>
  );
}
