import React from 'react';
import { Platform } from 'react-native';
import { Container, LogoWrapper, Logo, Title, Text } from './styles';

import { useRouter } from 'expo-router';

import { Button } from '@components/Button';

const LOGO_URL = '@assets/logo.png';

// Terminal step of the welcome flow: the shell (WelcomeFlow) provides the
// Screen / Gradient chrome and the step indicator; this screen keeps only
// its auth content and actions.
export function Welcome() {
  const router = useRouter();

  function handlePressSignIn() {
    router.navigate('/signIn');
  }

  function handlePressSignUp() {
    router.navigate('/signUp');
  }

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LogoWrapper>
        <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
      </LogoWrapper>

      <Title>
        Controle suas {'\n'}finanças de forma {'\n'}
        <Title primary>simples</Title> e <Title primary>precisa</Title>.
      </Title>

      <Button.Root
        onPress={() => handlePressSignIn()}
        style={{ width: '50%', alignSelf: 'center' }}
      >
        <Button.Text text='Login' />
      </Button.Root>

      <Text onPress={() => handlePressSignUp()}>Criar uma conta</Text>
    </Container>
  );
}
