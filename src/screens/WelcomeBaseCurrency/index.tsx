import React, { useRef } from 'react';

import { Container, Title, Text, SelectButtonContainer, ButtonContainer } from './styles';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CoinsIcon } from 'phosphor-react-native/src/icons/Coins';

import { useTheme } from 'styled-components';

import { Button } from '@components/Button';
import { SelectButton } from '@components/SelectButton';
import { BaseCurrencySelectSheet } from '@components/BaseCurrencySelectSheet';

import { useUserConfigs } from '@stores/userConfigsStorage';

import type { WelcomeStepProps } from '@screens/WelcomeFlow';

import { ThemeProps } from '@interfaces/theme';

// Welcome flow step (BC-12): educates the user that a default currency can
// be set and offers the selection right here. RegisterAccount's
// bottom-sheet pattern drives the shared BaseCurrencySelectSheet.
export function WelcomeBaseCurrency({ onNext }: WelcomeStepProps) {
  const theme = useTheme() as ThemeProps;
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);

  const baseCurrency = useUserConfigs((state) => state.baseCurrency);

  function handleOpenSelectCurrencyModal() {
    currencyBottomSheetRef.current?.present();
  }

  return (
    <Container>
      <Title>
        Escolha sua {'\n'}
        <Title primary>moeda base</Title>
      </Title>

      <Text>
        Você pode definir uma moeda padrão para ver seus saldos e totais no
        app. Selecione abaixo — o Real é o padrão.
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
        <Button.Root onPress={() => onNext?.()}>
          <Button.Text text='Continuar' />
        </Button.Root>
      </ButtonContainer>

      <BaseCurrencySelectSheet bottomSheetRef={currencyBottomSheetRef} />
    </Container>
  );
}
