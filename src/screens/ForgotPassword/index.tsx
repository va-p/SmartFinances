import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  Container,
  SectionHeader,
  MainContent,
  LogoWrapper,
  Logo,
  SubTitle,
  FormWrapper,
  Text,
} from './styles';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import * as Icon from 'phosphor-react-native';
import { yupResolver } from '@hookform/resolvers/yup';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ControlledInput } from '@components/Form/ControlledInput';

const LOGO_URL = '@assets/logo.png';

type FormData = {
  email: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  email: Yup.string()
    .email('Digite um e-mail válido')
    .required('Digite o seu e-mail'),
});
/* Validation Form - End */

export function ForgotPassword({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  async function handleResetPassword(form: FormData) {
    try {
      setLoading(true);

      // TODO: Call endpoint to handle with reset pass (Xano > Sendgrid)
      navigation.navigate('ResetPassSentConfirmation', {
        email: form.email,
      });
    } catch (error) {
      console.error(
        'ForgotPassword screen, handleResetPassword error =>',
        error
      );
      if (axios.isAxiosError(error)) {
        Alert.alert('Login', `${error.response?.data?.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePressGoBack() {
    navigation.goBack();
  }

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Gradient />

      <SectionHeader>
        <Header.Root>
          <Header.BackButton />
          <Header.Title title={'Recuperar senha'} />
        </Header.Root>
      </SectionHeader>

      <MainContent>
        <LogoWrapper>
          <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
        </LogoWrapper>

        <SubTitle>Esqueceu sua senha?</SubTitle>
        <Text style={{ textAlign: 'center', marginBottom: 64 }}>
          Digite seu e-mail abaixo e enviaremos à você instruções para redefinir
          sua senha.
        </Text>

        <FormWrapper>
          <ControlledInput
            placeholder='E-mail'
            autoCapitalize='none'
            autoCorrect={false}
            autoComplete='email'
            keyboardType='email-address'
            textContentType='emailAddress'
            name='email'
            control={control}
            error={errors.email}
            icon={Icon.UserCircle}
          />

          <Button.Root
            isLoading={loading}
            onPress={handleSubmit(handleResetPassword)}
            style={{ width: '50%', alignSelf: 'center' }}
          >
            <Button.Text text='Continuar' />
          </Button.Root>
        </FormWrapper>

        <Text onPress={handlePressGoBack}>Voltar para Login</Text>
      </MainContent>
    </Container>
  );
}
