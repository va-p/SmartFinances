import { Button, ButtonShape } from './styles';

import { useNavigation } from '@react-navigation/native';
import ArrowLeft from 'phosphor-react-native/src/icons/ArrowLeft';

import theme from '@themes/theme';

export function HeaderBackButton() {
  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  }

  return (
    <Button onPress={handleClickBackButton}>
      <ButtonShape>
        <ArrowLeft size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
