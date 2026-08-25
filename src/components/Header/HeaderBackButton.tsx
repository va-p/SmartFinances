import { Button, ButtonShape } from './styles';

import { useTheme } from 'styled-components';
import { useNavigation } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';

import { ThemeProps } from '@interfaces/theme';

export function HeaderBackButton() {
  const theme = useTheme() as ThemeProps;

  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  }

  return (
    <Button onPress={handleClickBackButton}>
      <ButtonShape>
        <ArrowLeftIcon size={20} color={theme.colors.text} />
      </ButtonShape>
    </Button>
  );
}
