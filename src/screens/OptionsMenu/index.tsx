import React from 'react';
import {
  Container,
  Content,
  ContentScroll,
  Title
} from './styles';

import { MoreOptionsButton } from '@components/MoreOptionsButton';
import { Header } from '@components/Header';

export function OptionsMenu({ navigation }: any) {
  function handleClickAccounts() {
    navigation.navigate('Cadastrar conta');
  }

  function handleClickCategories() {
    navigation.navigate('Cadastrar categoria');
  }

  return (
    <Container>
      <Header  type='secondary' title='Mais opções' />
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

      </ContentScroll>
    </Container>
  );
}