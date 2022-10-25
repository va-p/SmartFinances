import React from 'react';
import { Linking } from 'react-native';
import {
  Container,
  ContentScroll,
  Title
} from './styles';

import { SelectButton } from '@components/SelectButton';
import { Header } from '@components/Header';

import theme from '@themes/theme';

export function OptionsMenu({ navigation }: any) {
  function handleClickCategories() {
    navigation.navigate('Categorias');
  };

  function handleClickHelpCenter() {
    navigation.navigate('Central de Ajuda');
  };

  function handleClickContactSupport() {
    Linking.openURL('mailto:contato@solucaodigital.tech')
  };

  function handleClickTermsOfUse() {
    navigation.navigate('Termos de Uso');
  };

  return (
    <Container>
      <Header type='secondary' title='Mais opções' />
      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon='bookmarks-outline'
          title='Categorias'
          color={theme.colors.primary}
          onPress={() => handleClickCategories()}
        />

        <Title>Sobre</Title>
        <SelectButton
          icon='help-buoy-outline'
          title='Central de Ajuda'
          color={theme.colors.primary}
          onPress={() => handleClickHelpCenter()}
        />

        <SelectButton
          icon='chatbubbles-outline'
          title='Contatar Suporte'
          color={theme.colors.primary}
          onPress={() => handleClickContactSupport()}
        />

        <SelectButton
          icon='shield-checkmark-outline'
          title='Termos de Uso'
          color={theme.colors.primary}
          onPress={() => handleClickTermsOfUse()}
        />
      </ContentScroll>
    </Container>
  );
}