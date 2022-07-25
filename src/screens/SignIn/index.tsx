import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { ControlledInput } from '@components/Form/ControlledInput';
import { SignInSocialButton } from '@components/SignInSocialButton'
import { Button } from '@components/Form/Button';

import GoogleSvg from '@assets/google.svg';
import AppleSvg from '@assets/apple.svg';
import LogoSvg from '@assets/logo.svg';

import { useAuth } from '@hooks/auth';

import {
  COLLECTION_TOKENS,
  COLLECTION_USERS
} from '@configs/database';

import { loadStoredUserData, signInWithXano } from '@services/auth';

import {
  setUserId,
  setUserName,
  setUserLastName,
  setUserEmail,
  setUserPhone,
  setUserRole,
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

  async function loadUserData() {
    await loadStoredUserData();
  };

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
      } else {
        Alert.alert("Login", "Credenciais inválidas, por favor, tente novamente.");
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

      switch (loggedInUserDataFormatted.role) {
        case 'admin':
          navigation.navigate('Home')
          break;
        case ('user'):
          navigation.navigate('Home')
        default: 'user';
          break;
      };


      setButtonIsLoading(false)
    } catch (error) {
      setButtonIsLoading(false)
      console.error(error);
      Alert.alert("Login", "Credenciais inválidas, por favor, tente novamente.");
    }
  };

  async function handleSignInWithGoogle() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível conectar a conta Google');
    }
  }

  async function handleSignInWithApple() {
    try {
      await signInWithApple();
    } catch (error) {
      console.error(error);
      Alert.alert('Não foi possível conectar a conta Apple');
    }
  }

  useEffect(() => {
    loadUserData();
  });

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
            type='secondary'
            placeholder='E-mail'
            autoCapitalize='none'
            autoCorrect={false}
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
            name='password'
            control={control}
            error={errors.password}
          />

          <Button
            title='Entrar'
            type='primary'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleSignInWithXano)}
          />
        </FooterWrapper>
      </Footer>
    </Container>
  );
}