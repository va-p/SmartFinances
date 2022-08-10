import React from 'react';
import { Linking } from 'react-native';
import {
  Container,
  ContentScroll,
  Title
} from './styles';

import { MoreOptionsButton } from '@components/MoreOptionsButton';
import { Header } from '@components/Header';

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
        <MoreOptionsButton
          icon='wallet-outline'
          title='Contas'
          onPress={() => handleClickAccounts()}
        />
        <MoreOptionsButton
          icon='bookmarks-outline'
          title='Categorias'
          onPress={() => handleClickCategories()}
        />
        <Title>Sobre</Title>
        <MoreOptionsButton
          icon='help-buoy-outline'
          title='Central de Ajuda'
          onPress={() => handleClickHelpCenter()}
        />
        <MoreOptionsButton
          icon='chatbubbles-outline'
          title='Contatar Suporte'
          onPress={() => handleClickContactSupport()}
        />
        <MoreOptionsButton
          icon='shield-checkmark-outline'
          title='Termos e Políticas'
          onPress={() => handleClickTermsAndPolices()}
        />
      </ContentScroll>
    </Container>
  );
}