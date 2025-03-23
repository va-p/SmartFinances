import React from 'react';
import {
  Container,
  MainContent,
  SectionHeader,
  SubTitle,
  Text,
} from './styles';

import { Envelope } from 'phosphor-react-native';
import { useRoute } from '@react-navigation/native';

import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';

export function ResetPasswordSentConfirmation({ navigation }: any) {
  const route = useRoute();
  const email: string = route.params?.email;

  function handlePressResend() {
    navigation.goBack();
  }

  return (
    <Container>
      <Gradient />

      <SectionHeader>
        <Header.Root>
          <Header.BackButton />
          <Header.Title title={'Recuperar senha'} />
        </Header.Root>
      </SectionHeader>

      <MainContent>
        <Envelope size={64} color='green' style={{ alignSelf: 'center' }} />

        <SubTitle>Verifique seu e-mail!</SubTitle>
        <Text style={{ textAlign: 'center', marginBottom: 64 }}>
          Por favor, verifique o endereço de e-mail {email} para obter
          instruções sobre como redefinir sua senha.
        </Text>

        <Button.Root
          onPress={handlePressResend}
          style={{ width: '50%', alignSelf: 'center' }}
        >
          <Button.Text text='Reenviar e-mail' />
        </Button.Root>
      </MainContent>
    </Container>
  );
}
