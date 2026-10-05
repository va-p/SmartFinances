import React from 'react';
import { Platform } from 'react-native';
import { Container, LogoWrapper, Logo, LogoText, Title } from './styles';

import { Button } from '@components/Button';

import type { WelcomeStepProps } from '@screens/WelcomeFlow';

const LOGO_URL = '@assets/logo.png';

export function Welcome({ onNext }: WelcomeStepProps) {

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LogoWrapper>
        <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
      </LogoWrapper>
      <LogoText>Smart Finances</LogoText>

      <Title>
        Controle suas {'\n'}finanças de forma {'\n'}
        <Title primary>simples</Title> e <Title primary>precisa</Title>
      </Title>

      <Button.Root onPress={() => onNext?.()}>
        <Button.Text text='Continuar' />
      </Button.Root>
    </Container>
  );
}
