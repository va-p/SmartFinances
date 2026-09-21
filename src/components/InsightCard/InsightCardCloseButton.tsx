import { CloseInsightButton } from './styles';

import { useTheme } from 'styled-components';

import { XIcon } from 'phosphor-react-native/src/icons/X';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  onPress: () => void;
};

export function InsightCardCloseButton({ onPress }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <CloseInsightButton onPress={onPress}>
      <XIcon size={20} color={theme.colors.primary} />
    </CloseInsightButton>
  );
}
