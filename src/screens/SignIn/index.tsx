import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  Container,
  SectionHeader,
  MainContent,
  Logo,
  SubTitle,
  LogoWrapper,
  FormWrapper,
  Text,
  SocialLoginButton,
} from './styles';

import { useAuth } from '../../contexts/AuthProvider';

// Dependencies
import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import * as WebBrowser from 'expo-web-browser';
import { useSSO, useOAuth } from '@clerk/clerk-expo';
import { yupResolver } from '@hookform/resolvers/yup';

// Icons
import Key from 'phosphor-react-native/src/icons/Key';
import UserCircle from 'phosphor-react-native/src/icons/UserCircle';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ScreenDivider } from '@components/ScreenDivider';
import { ControlledInput } from '@components/Form/ControlledInput';

import { ThemeProps } from '@interfaces/theme';

const LOGO_URL = '@assets/logo.png';
const GOOGLE_LOGO_URL = '@assets/googleLogo.png';

type FormData = {
  email: string;
  password: string;
};

WebBrowser.maybeCompleteAuthSession();

/* Validation Form - Start */
const schema = Yup.object().shape({
  email: Yup.string()
    .email('Digite um e-mail válido')
    .required('Digite o seu e-mail'),
  password: Yup.string().required('Digite a sua senha'),
});
/* Validation Form - End */

export function SignIn({ navigation }: any) {
  const theme: ThemeProps = useTheme();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const { signInWithXano } = useAuth();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });

  async function handleSignInWithXano(form: FormData) {
    try {
      setLoading(true);

      await signInWithXano(form);
    } catch (error) {
      console.error('SignIn screen, handleSignInWithXano error =>', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Login', `${error.response?.data?.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleContinueWithGoogle() {
    try {
      setLoading(true);
      const oAuthFlow = await googleOAuth.startOAuthFlow();

      if (
        oAuthFlow.authSessionResult?.type === 'success' &&
        oAuthFlow.createdSessionId
      ) {
        await oAuthFlow.setActive!({
          session: oAuthFlow.createdSessionId,
        });
        return;
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível autenticar com o Google. Por favor, tente novamente.'
        );
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('SignIn screen, handleContinueWithGoogle error =>', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Login', error.response?.data?.message);
      }
    } finally {
      // setLoading(false);
    }
  }

  function handlePressForgotPassword() {
    navigation.navigate('ForgotPassword');
  }

  function handlePressSignUp() {
    navigation.navigate('SignUp');
  }

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <Screen>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Gradient />

        <SectionHeader>
          <Header.Root>
            <Header.BackButton />
            <Header.Title title={'Login'} />
          </Header.Root>
        </SectionHeader>

        <MainContent>
          <LogoWrapper>
            <Logo source={require(LOGO_URL)} style={{ width: '30%' }} />
          </LogoWrapper>

          <SubTitle>Faça Login abaixo</SubTitle>

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
              icon={UserCircle}
            />
            <ControlledInput
              placeholder='Senha'
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry={true}
              textContentType='password'
              name='password'
              control={control}
              error={errors.password}
              icon={Key}
              returnKeyType='go'
              onSubmitEditing={handleSubmit(handleSignInWithXano)}
            />

            <Text
              style={{ textAlign: 'right', marginTop: -8 }}
              onPress={handlePressForgotPassword}
            >
              Esqueceu sua senha?
            </Text>

            <Button.Root
              isLoading={loading}
              onPress={handleSubmit(handleSignInWithXano)}
              style={{ width: '50%', alignSelf: 'center' }}
            >
              <Button.Text text='Login' />
            </Button.Root>
          </FormWrapper>

          <ScreenDivider text='Ou' />

          <SocialLoginButton onPress={handleContinueWithGoogle}>
            <Logo source={require(GOOGLE_LOGO_URL)} style={{ width: '15%' }} />
            <Text
              style={{ marginLeft: 8, color: theme.colors.textPlaceholder }}
            >
              Fazer login com o Google
            </Text>
          </SocialLoginButton>

          <Text style={{ textAlign: 'right', marginTop: 16 }}>
            Ainda não tem uma conta?{' '}
            <Text
              style={{ color: theme.colors.primary }}
              onPress={handlePressSignUp}
            >
              Cadastre-se
            </Text>
          </Text>
        </MainContent>
      </Container>
    </Screen>
  );
}
