import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Container, MainContent } from './styles';
import {
  Text,
  LogoWrapper,
  Logo,
  SubTitle,
  SectionHeader,
  SocialLoginButton,
  FormWrapper,
} from '@screens/SignIn/styles';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useOAuth, useSSO } from '@clerk/clerk-expo';
import * as Icon from 'phosphor-react-native';
import * as WebBrowser from 'expo-web-browser';
import { yupResolver } from '@hookform/resolvers/yup';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ScreenDivider } from '@components/ScreenDivider';
import { ControlledInput } from '@components/Form/ControlledInput';

import api from '@api/api';

import theme from '@themes/theme';

import { eUrl } from '@enums/enumsUrl';

const LOGO_URL = '@assets/logo.png';

type FormData = {
  name: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  checkbox: boolean;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o seu nome'),
  lastName: Yup.string().required('Digite o seu sobrenome'),
  email: Yup.string()
    .required('Digite o seu e-mail')
    .email('Digite um e-mail válido'),
  phone: Yup.number()
    .required('Digite o seu telefone celular')
    .typeError('Digite apenas números'),
  password: Yup.string()
    .required('Digite a sua senha')
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'A senha deve ter uma letra maiúscula')
    .matches(/[a-z]/, 'A senha deve ter uma letra minúscula')
    .matches(/[0-9]/, 'A senha deve ter um número'),
  confirmPassword: Yup.string()
    .required('Confirme a sua senha')
    .oneOf([Yup.ref('password'), null], 'As senhas não conferem'),
  checkbox: Yup.bool().oneOf(
    [true],
    'Aceite os Termos de Uso e a Política de Privacidade'
  ),
});
/* Validation Form - End */

export function SignUp({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const googleOAuth = useSSO();

  async function handlePressTermsOfUse() {
    await WebBrowser.openBrowserAsync(eUrl.TERMS_OF_USE_URL);
  }

  async function handlePressPolicyPrivacy() {
    await WebBrowser.openBrowserAsync(eUrl.PRIVACY_POLICY_URL);
  }

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleContinueWithGoogle() {
    try {
      setLoading(true);
      // const oAuthFlow = await googleOAuth.startOAuthFlow();
      const oAuthFlow = await googleOAuth.startSSOFlow({
        strategy: 'oauth_google',
      });

      if (
        oAuthFlow.authSessionResult?.type === 'success' &&
        oAuthFlow.createdSessionId
      ) {
        if (oAuthFlow.setActive) {
          await oAuthFlow.setActive({
            session: oAuthFlow.createdSessionId,
          });
        }
      } else {
        // Use signIn or signUp returned from startOAuthFlow
        // for next steps, such as MFA
      }
    } catch (error) {
      console.error('SignIn screen, handleContinueWithGoogle error =>', error);
      if (axios.isAxiosError(error)) {
        Alert.alert(
          'Login',
          `Não foi possível autenticar com o Google: ${error.response?.data?.message}. Por favor, tente novamente.`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterUser(form: FormData) {
    setLoading(true);

    try {
      const newTenant = {
        corporate_name: form.lastName,
        trade_name: form.name,
        ein: 0,
        email: form.email,
        phone: form.phone,
        subscription_id: 1,
        contact_1: form.name,
      };

      const newUser = {
        name: form.name,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      const tenantAndUser = { ...newTenant, ...newUser };
      const { status } = await api.post('auth/signup', tenantAndUser);

      if (status === 200) {
        Alert.alert(
          'Cadastro de usuário',
          'Bem vindo ao Smart Finances! Você será redirecionado para a tela de login.',
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'SignUp handleRegisterUser error =>',
          error.response?.data?.message
        );
        Alert.alert(
          'Cadastro de usuário',
          `Não foi possível concluir o cadastro: ${error.response?.data?.message}. Por favor, tente novamente.`
          // 'Não foi possível concluir o cadastro. Por favor, verifique sua conexão com a internet e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Gradient
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}
      />

      <SectionHeader>
        <Header.Root>
          <Header.BackButton />
          <Header.Title title={'Cadastro'} />
        </Header.Root>
      </SectionHeader>

      <MainContent>
        <LogoWrapper style={{ marginBottom: -16 }}>
          <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
        </LogoWrapper>

        <SubTitle style={{ marginBottom: 8 }}>
          Faça seu cadastro abaixo
        </SubTitle>

        <FormWrapper style={{ marginBottom: 16 }}>
          <ControlledInput
            placeholder='Nome'
            autoCapitalize='words'
            autoCorrect={false}
            autoComplete='name'
            textContentType='name'
            name='name'
            control={control}
            error={errors.name}
          />

          <ControlledInput
            placeholder='E-mail'
            autoCapitalize='none'
            keyboardType='email-address'
            autoCorrect={false}
            autoComplete='email'
            textContentType='emailAddress'
            name='email'
            control={control}
            error={errors.email}
          />

          <ControlledInput
            placeholder='Senha'
            autoCorrect={false}
            secureTextEntry={true}
            autoComplete='password-new'
            textContentType='newPassword'
            name='password'
            control={control}
            error={errors.password}
          />

          <ControlledInput
            placeholder='Repetir senha'
            autoCorrect={false}
            secureTextEntry={true}
            autoComplete='password-new'
            textContentType='newPassword'
            name='confirmPassword'
            control={control}
            error={errors.confirmPassword}
            returnKeyType='go'
            onSubmitEditing={handleSubmit(handleRegisterUser)}
          />
        </FormWrapper>

        <ScreenDivider text='Ou' />

        <SocialLoginButton
          onPress={handleContinueWithGoogle}
          style={{ marginTop: 8 }}
        >
          <Icon.GoogleLogo />
          <Text style={{ marginLeft: 8, color: theme.colors.textPlaceholder }}>
            Entrar com o Google
          </Text>
        </SocialLoginButton>

        <Text
          style={{
            textAlign: 'center',
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          Ao me cadastrar, eu declaro que li e aceito os{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={handlePressTermsOfUse}
          >
            Termos de Uso
          </Text>{' '}
          e a{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={handlePressPolicyPrivacy}
          >
            Política de Privacidade
          </Text>
          .
        </Text>

        <Button.Root
          type='secondary'
          isLoading={loading}
          onPress={handleSubmit(handleRegisterUser)}
        >
          <Button.Text type='secondary' text='Cadastrar' />
        </Button.Root>

        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Já possui uma conta?{' '}
          <Text style={{ color: theme.colors.primary }} onPress={handleGoBack}>
            Login
          </Text>
        </Text>
      </MainContent>
    </Container>
  );
}
