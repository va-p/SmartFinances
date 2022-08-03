import { Button } from '@components/Form/Button';
import React from 'react';
import {
  Container
} from './styles';


export function OptionsMenu({ navigation }: any) {
  function handleClickRegisterAccount() {
    navigation.navigate('Cadastrar conta');
  }

  return (
    <Container>
      <Button
        type='secondary'
        title='Cadastrar Conta'
        onPress={() => handleClickRegisterAccount()}
      />

      <Button
        type='secondary'
        title='Cadastrar Categoria'
        onPress={() => handleClickRegisterAccount()}
      />
    </Container>
  );
}