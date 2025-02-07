import { Button, ButtonShape } from './styles';

import * as Icon from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

import theme from '@themes/theme';

export function HeaderBackButton() {
  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  }

  return (
    <Button onPress={handleClickBackButton}>
      <ButtonShape>
        <Icon.ArrowLeft size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
