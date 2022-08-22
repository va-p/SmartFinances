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
  function handleClickAccounts() {
    navigation.navigate('Contas');
  }

  function handleClickCategories() {
    navigation.navigate('Categorias');
  }

  function handleClickHelpCenter() {
    navigation.navigate('Central de Ajuda');
  }

  function handleClickContactSupport() {
    Linking.openURL('mailto:contato@solucaodigital.tech')
  }

  function handleClickTermsAndPolices() {
    navigation.navigate('Termos e Políticas');
  }

  return (
    <Container>
      <Header type='secondary' title='Mais opções' />
      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon='wallet-outline'
          title='Contas'
          color={theme.colors.secondary}
          onPress={() => handleClickAccounts()}
        />

        <SelectButton
          icon='bookmarks-outline'
          title='Categorias'
          color={theme.colors.secondary}
          onPress={() => handleClickCategories()}
        />

        <Title>Sobre</Title>
        <SelectButton
          icon='help-buoy-outline'
          title='Central de Ajuda'
          color={theme.colors.secondary}
          onPress={() => handleClickHelpCenter()}
        />

        <SelectButton
          icon='chatbubbles-outline'
          title='Contatar Suporte'
          color={theme.colors.secondary}
          onPress={() => handleClickContactSupport()}
        />
        
        <SelectButton
          icon='shield-checkmark-outline'
          title='Termos e Políticas'
          color={theme.colors.secondary}
          onPress={() => handleClickTermsAndPolices()}
        />
      </ContentScroll>
    </Container>
  );
}