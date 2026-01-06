import { CloseInsightButton } from './styles';

import { useTheme } from 'styled-components';

import X from 'phosphor-react-native/src/icons/X';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  onPress: () => void;
};

export function InsightCardCloseButton({ onPress }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <CloseInsightButton onPress={onPress}>
      <X size={20} color={theme.colors.primary} />
    </CloseInsightButton>
  );
}
