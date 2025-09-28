import React from 'react';
import { Platform } from 'react-native';
import { Container, LogoWrapper, Logo, Title, Text } from './styles';

import { useRouter } from 'expo-router';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

const LOGO_URL = '@assets/logo.png';

export function Welcome({ navigation }: any) {
  const router = useRouter();

  function handlePressSignIn() {
    router.navigate('/signIn');
  }

  function handlePressSignUp() {
    router.navigate('/signUp');
  }

  return (
    <Screen>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Gradient />

        <LogoWrapper>
          <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
        </LogoWrapper>

        <Title>
          Controle suas {'\n'}finanças de forma {'\n'}
          <Title primary>simples</Title> e <Title primary>precisa</Title>.
        </Title>

        <Button.Root
          onPress={handlePressSignIn}
          style={{ width: '50%', alignSelf: 'center' }}
        >
          <Button.Text text='Login' />
        </Button.Root>

        <Text onPress={handlePressSignUp}>Criar uma conta</Text>
      </Container>
    </Screen>
  );
}
