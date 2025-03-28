import { CloseInsightButton } from './styles';

import X from 'phosphor-react-native/src/icons/X';

import theme from '@themes/theme';

type Props = {
  onPress: () => void;
};

export function InsightCardCloseButton({ onPress }: Props) {
  return (
    <CloseInsightButton onPress={onPress}>
      <X size={20} color={theme.colors.primary} />
    </CloseInsightButton>
  );
}
