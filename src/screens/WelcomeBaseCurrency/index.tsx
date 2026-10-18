import React, { useRef } from 'react';

import {
  Container,
  Title,
  Text,
  SelectButtonContainer,
  ButtonContainer,
} from './styles';

import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CoinsIcon } from 'phosphor-react-native/src/icons/Coins';

import { useTheme } from 'styled-components';

import { Button } from '@components/Button';
import { SelectButton } from '@components/SelectButton';
import { BaseCurrencySelectSheet } from '@components/BaseCurrencySelectSheet';

import { useUserConfigs } from '@stores/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';

// Welcome flow step (BC-12): educates the user that a default currency can
// be set and offers the selection right here. RegisterAccount's
// bottom-sheet pattern drives the shared BaseCurrencySelectSheet.
export function WelcomeBaseCurrency() {
  const router = useRouter();
  const theme = useTheme() as ThemeProps;
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);

  const baseCurrency = useUserConfigs((state) => state.baseCurrency);

  function handleOpenSelectCurrencyModal() {
    currencyBottomSheetRef.current?.present();
  }

  function handlePressSignIn() {
    router.navigate('/signIn');
  }

  function handlePressSignUp() {
    router.navigate('/signUp');
  }

  return (
    <Container>
      <CoinsIcon size={40} color={theme.colors.primary} />

      <Title>
        Escolha sua {'\n'}
        <Title primary>moeda</Title>
      </Title>

      <Text>
        Você pode definir qual a moeda padrão para ver seus saldos e totais no app.
        Selecione-a abaixo.
      </Text>

      <SelectButtonContainer>
        <SelectButton
          title='Moeda base'
          subTitle={baseCurrency.name}
          icon={<CoinsIcon color={theme.colors.primary} />}
          onPress={() => handleOpenSelectCurrencyModal()}
        />
      </SelectButtonContainer>

      <ButtonContainer>
        <Button.Root
          onPress={() => handlePressSignIn()}
          style={{ width: '50%', alignSelf: 'center' }}
        >
          <Button.Text text='Login' />
        </Button.Root>

        <Text onPress={() => handlePressSignUp()}>Criar uma conta</Text>
      </ButtonContainer>

      <BaseCurrencySelectSheet bottomSheetRef={currencyBottomSheetRef} />
    </Container>
  );
}
