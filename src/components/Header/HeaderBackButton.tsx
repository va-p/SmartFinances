import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';
import { useNavigation } from '@react-navigation/native';
import ArrowLeft from 'phosphor-react-native/src/icons/ArrowLeft';

import { ThemeProps } from '@interfaces/theme';

export function HeaderBackButton() {
  const theme: ThemeProps = useTheme();

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
