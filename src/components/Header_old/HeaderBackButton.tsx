import { BackButton } from './styles';

import { useNavigation } from '@react-navigation/native';
import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';

import theme from '@themes/theme';

export function HeaderBackButton() {
  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  }

  return (
    <BackButton onPress={handleClickBackButton}>
      <CaretLeft size={20} color={theme.colors.primary} />
    </BackButton>
  );
}
