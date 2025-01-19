import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, View } from 'react-native';
import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper,
  WrapperTextSignUp,
  TextSignUp,
  LinkSignUp,
} from './styles';

import { useAuth } from '../../contexts/AuthProvider';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { GoogleLogo } from 'phosphor-react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { RFValue } from 'react-native-responsive-fontsize';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { Button } from '@components/Button';
import { ControlledInput } from '@components/Form/ControlledInput';

import {
  Link,
  TermsAndPolicy,
  TermsAndPolicyContainer,
} from '@screens/SignUp/styles';

import LogoSvg from '@assets/logo.svg';

import theme from '@themes/theme';

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

  const { signInWithXano, signInWithBiometrics } = useAuth();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });

  const SCREEN_WIDTH = Dimensions.get('window').width - 64;
  const formPositionX = useSharedValue(0);
  const initialPositionX = useSharedValue(formPositionX.value);

  const animatedEmailLoginButton = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: formPositionX.value }],
      width: SCREEN_WIDTH,
    };
  });

  const animatedEmailLoginStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: formPositionX.value }],
      width: SCREEN_WIDTH,
    };
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      initialPositionX.value = formPositionX.value;
    })
    .onUpdate((e) => {
      formPositionX.value = initialPositionX.value + e.translationX;
    })
    .onEnd(() => {
      if (formPositionX.value < -SCREEN_WIDTH / 2) {
        runOnJS(showForm)();
      } else {
        runOnJS(hideForm)();
      }
    });

  function showForm() {
    formPositionX.value = withTiming(-SCREEN_WIDTH, {
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
    });
  }

  function hideForm() {
    formPositionX.value = withTiming(0, {
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
    });
  }

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

      // console.log('oAuthFlow =>', oAuthFlow);

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

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)} />

          <Title>
            Controle suas {'\n'}
            finanças de forma {'\n'}
            simples e precisa
          </Title>
        </TitleWrapper>

        <SignInTitle>Faça seu login abaixo {'\n'}</SignInTitle>
      </Header>

      <Footer>
        <FooterWrapper style={{ paddingTop: 32 }}>
          <GestureDetector gesture={gesture}>
            <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
              {/* First section */}
              <Animated.View style={animatedEmailLoginButton}>
                <Button.Root
                  type='primary'
                  isLoading={loading}
                  onPress={handleContinueWithGoogle}
                >
                  <Button.Icon
                    icon={GoogleLogo}
                    size={24}
                    color={theme.colors.text_light}
                  />
                  <Button.Text type='primary' text='Entrar com o Google' />
                </Button.Root>

                <Button.Root
                  type='primary'
                  isLoading={loading}
                  onPress={showForm}
                >
                  <Button.Text type='primary' text='Entrar com email' />
                </Button.Root>
                <TermsAndPolicyContainer>
                  <TermsAndPolicy>
                    Ao me cadastrar, eu declaro que li e concordo com os{' '}
                    <Link onPress={() => navigation.navigate('Termos de Uso')}>
                      Termos de Uso
                    </Link>{' '}
                    e{' '}
                    <Link
                      onPress={() =>
                        navigation.navigate('Política de Privacidade')
                      }
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </TermsAndPolicy>
                </TermsAndPolicyContainer>
              </Animated.View>

              {/* Second section */}
              <Animated.View style={animatedEmailLoginStyle}>
                <ControlledInput
                  type='primary'
                  placeholder='E-mail'
                  autoCapitalize='none'
                  autoCorrect={false}
                  autoComplete='email'
                  keyboardType='email-address'
                  textContentType='emailAddress'
                  name='email'
                  control={control}
                  error={errors.email}
                />
                <ControlledInput
                  type='secondary'
                  placeholder='Senha'
                  autoCapitalize='none'
                  autoCorrect={false}
                  secureTextEntry={true}
                  textContentType='password'
                  name='password'
                  control={control}
                  error={errors.password}
                  returnKeyType='go'
                  onSubmitEditing={handleSubmit(handleSignInWithXano)}
                />
                <Button.Root
                  isLoading={loading}
                  onPress={handleSubmit(handleSignInWithXano)}
                >
                  <Button.Text text='Entrar' />
                </Button.Root>

                <WrapperTextSignUp>
                  <TextSignUp>
                    Não tem uma conta?{' '}
                    <LinkSignUp onPress={() => navigation.navigate('SignUp')}>
                      Cadastre-se
                    </LinkSignUp>
                  </TextSignUp>
                </WrapperTextSignUp>
              </Animated.View>
            </View>
          </GestureDetector>
        </FooterWrapper>
      </Footer>
    </Container>
  );
}
