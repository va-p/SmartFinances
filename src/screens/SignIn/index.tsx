import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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
  LinkSignUp
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import axios from 'axios';

import { ControlledInput } from '@components/Form/ControlledInput';
import { SignInSocialButton } from '@components/SignInSocialButton'
import { Button } from '@components/Button';

import GoogleSvg from '@assets/google.svg';
import AppleSvg from '@assets/apple.svg';
import LogoSvg from '@assets/logo.svg';

import { useAuth } from '@hooks/auth';

import {
  COLLECTION_TOKENS,
  COLLECTION_USERS
} from '@configs/database';

import {
  setUserId,
  setUserName,
  setUserLastName,
  setUserEmail,
  setUserPhone,
  setUserRole,
  setUserLocalAuthentication,
  setUserProfileImage,
  setUserTenantId,
} from '@slices/userSlice';

import api from '@api/api';

type FormData = {
  email: string;
  password: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  email: Yup
    .string()
    .email("Digite um e-mail válido")
    .required("Digite o seu e-mail"),
  password: Yup
    .string()
    .required("Digite a sua senha")
});
/* Validation Form - End */

export function SignIn({ navigation }: any) {
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const { signInWithGoogle, signInWithApple } = useAuth();
  const dispatch = useDispatch();

  async function handleSignInWithXano(form: FormData) {
    setButtonIsLoading(true)

    const SignInUser = {
      email: form.email,
      password: form.password
    }

    try {
      const { data, status } = await api.post('auth/login', SignInUser);
      if (status === 200) {
        try {
          await AsyncStorage.setItem(COLLECTION_TOKENS, JSON.stringify(data.authToken));
        } catch (error) {
          console.error(error);
          Alert.alert(`Erro: ${error}`);
        }
      }

      const userData = await api.get('auth/me');

      const loggedInUserDataFormatted = {
        id: userData.data.id,
        name: userData.data.name,
        lastName: userData.data.last_name,
        email: userData.data.email,
        phone: userData.data.phone,
        role: userData.data.role,
        image: userData.data.image,
        tenantId: userData.data.tenant_id,
      };

      await AsyncStorage.setItem(COLLECTION_USERS, JSON.stringify(loggedInUserDataFormatted));

      dispatch(
        setUserId(loggedInUserDataFormatted.id)
      );
      dispatch(
        setUserName(loggedInUserDataFormatted.name)
      );
      dispatch(
        setUserLastName(loggedInUserDataFormatted.lastName)
      );
      dispatch(
        setUserEmail(loggedInUserDataFormatted.email)
      );
      dispatch(
        setUserPhone(loggedInUserDataFormatted.phone)
      );
      dispatch(
        setUserRole(loggedInUserDataFormatted.role)
      );
      dispatch(
        setUserProfileImage(loggedInUserDataFormatted.image)
      );
      dispatch(
        setUserTenantId(loggedInUserDataFormatted.tenantId)
      );

      navigation.navigate('Home');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Login", error.response?.data.message);
      }
    } finally {
      setButtonIsLoading(false);
    };
  };

  async function handleSignInWithBiometric() {
    setButtonIsLoading(true);

    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Entrar com Biometria",
        cancelLabel: "Cancelar",
      });
      if (biometricAuth.success) {
        try {
          const userData = await AsyncStorage.getItem(COLLECTION_USERS);
          if (userData) {
            const userDataParsed = JSON.parse(userData);

            dispatch(
              setUserId(userDataParsed.id)
            );
            dispatch(
              setUserName(userDataParsed.name)
            );
            dispatch(
              setUserLastName(userDataParsed.lastName)
            );
            dispatch(
              setUserEmail(userDataParsed.email)
            );
            dispatch(
              setUserPhone(userDataParsed.phone)
            );
            dispatch(
              setUserRole(userDataParsed.role)
            );
            dispatch(
              setUserLocalAuthentication(userDataParsed.use_local_authentication)
            );
            dispatch(
              setUserProfileImage(userDataParsed.image)
            );
            dispatch(
              setUserTenantId(userDataParsed.tenantId)
            );
          }

          navigation.navigate('Home');
        } catch (error) {
          console.error(error);
          Alert.alert("Login", "Não foi possível buscar seus dados no dispositivo, por favor, verifique sua conexão com a internet e tente novamente.");
        };
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Login", "Não foi possível autenticar com a biometria, por favor, verifique sua conexão com a internet e tente novamente.");
    } finally {
      setButtonIsLoading(false);
    };
  };

  async function handleSignInWithGoogle() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível conectar a conta Google');
    }
  };

  async function handleSignInWithApple() {
    try {
      await signInWithApple();
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível conectar a conta Apple');
    }
  };

  useFocusEffect(useCallback(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enroll = await LocalAuthentication.isEnrolledAsync();

      const userData = await AsyncStorage.getItem(COLLECTION_USERS);
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        var localAuth = userDataParsed.useLocalAuth;
      }

      if (compatible && enroll && localAuth) {
        handleSignInWithBiometric();
      } else return
    })();
  }, []));

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg
            width={RFValue(120)}
            height={RFValue(68)}
          />

          <Title>
            Controle suas {'\n'}
            finanças de forma {'\n'}
            simples e precisa.
          </Title>
        </TitleWrapper>

        <SignInTitle>
          Faça seu login abaixo {'\n'}
        </SignInTitle>
      </Header>

      <Footer>
        <FooterWrapper>
          <ControlledInput
            type='primary'
            placeholder='E-mail'
            autoCapitalize='none'
            autoCorrect={false}
            autoComplete='email'
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

          <Button
            title='Entrar'
            type='primary'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleSignInWithXano)}
          />

          <WrapperTextSignUp>
            <TextSignUp>Não tem uma conta? <LinkSignUp onPress={() => navigation.navigate('SignUp')}>Cadastre-se</LinkSignUp></TextSignUp>
          </WrapperTextSignUp>
        </FooterWrapper>
      </Footer>
    </Container>
  );
}