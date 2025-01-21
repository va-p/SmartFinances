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

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Icon from 'phosphor-react-native';
import { yupResolver } from '@hookform/resolvers/yup';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ScreenDivider } from '@components/ScreenDivider';
import { ControlledInput } from '@components/Form/ControlledInput';

import theme from '@themes/theme';

import { UrlEnum } from '@enums/enumsUrl';

const LOGO_URL = '@assets/logo.png';

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
        Alert.alert(
          'Login',
          `Não foi possível autenticar com e-mail e senha: ${error.response?.data?.message}. Por favor, verifique sua conexão com a internet e tente novamente.`
        );
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

  function handlePressSignUp() {
    navigation.navigate('SignUp');
  }

  async function handlePressPolicyPrivacy() {
    await WebBrowser.openBrowserAsync(UrlEnum.PRIVACY_POLICY_URL);
  }

  async function handlePressTermsOfUse() {
    await WebBrowser.openBrowserAsync(UrlEnum.TERMS_OF_USE_URL);
  }

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

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
            icon={Icon.UserCircle}
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
            icon={Icon.Key}
            returnKeyType='go'
            onSubmitEditing={handleSubmit(handleSignInWithXano)}
          />

          <Text style={{ textAlign: 'right', marginTop: -8 }}>
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
          <Icon.GoogleLogo />
          <Text style={{ marginLeft: 8, color: theme.colors.text_placeholder }}>
            Fazer login com o Google
          </Text>
        </SocialLoginButton>

        <Text style={{ textAlign: 'right', marginTop: 16 }}>
          Ainda não tem uma conta?{' '}
          <Text
            style={{ color: theme.colors.primary }}
            onPress={() => navigation.navigate('SignUp')}
          >
            Cadastre-se
          </Text>
        </Text>
      </MainContent>
    </Container>
  );
}
