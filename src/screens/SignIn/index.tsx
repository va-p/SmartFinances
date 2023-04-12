import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
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

import * as LocalAuthentication from 'expo-local-authentication';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import axios from 'axios';

import { ControlledInput } from '@components/Form/ControlledInput';
import { Button } from '@components/Button';

import LogoSvg from '@assets/logo.svg';

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

import {
  DATABASE_CONFIGS,
  DATABASE_TOKENS,
  DATABASE_USERS,
  storageConfig,
  storageToken,
  storageUser,
} from '@database/database';

import api from '@api/api';

type FormData = {
  email: string;
  password: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  email: Yup.string()
    .email('Digite um e-mail válido')
    .required('Digite o seu e-mail'),
  password: Yup.string().required('Digite a sua senha'),
});
/* Validation Form - End */

export function SignIn({ navigation }: any) {
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const dispatch = useDispatch();

  async function handleSignInWithXano(form: FormData) {
    setButtonIsLoading(true);

    const SignInUser = {
      email: form.email,
      password: form.password,
    };

    try {
      const { data, status } = await api.post('auth/login', SignInUser);
      if (status === 200) {
        try {
          storageToken.set(
            `${DATABASE_TOKENS}`,
            JSON.stringify(data.authToken)
          );
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

      storageUser.set(
        `${DATABASE_USERS}`,
        JSON.stringify(loggedInUserDataFormatted)
      );

      dispatch(setUserId(loggedInUserDataFormatted.id));
      dispatch(setUserName(loggedInUserDataFormatted.name));
      dispatch(setUserLastName(loggedInUserDataFormatted.lastName));
      dispatch(setUserEmail(loggedInUserDataFormatted.email));
      dispatch(setUserPhone(loggedInUserDataFormatted.phone));
      dispatch(setUserRole(loggedInUserDataFormatted.role));
      dispatch(setUserProfileImage(loggedInUserDataFormatted.image));
      dispatch(setUserTenantId(loggedInUserDataFormatted.tenantId));

      navigation.navigate('Home');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Login', error.response?.data.message);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleSignInWithBiometric() {
    setButtonIsLoading(true);

    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entrar com Biometria',
        cancelLabel: 'Cancelar',
      });
      if (biometricAuth.success) {
        try {
          const jsonUser = storageUser.getString('user');
          if (jsonUser) {
            const userObject = JSON.parse(jsonUser);

            dispatch(setUserId(userObject.id));
            dispatch(setUserName(userObject.name));
            dispatch(setUserLastName(userObject.lastName));
            dispatch(setUserEmail(userObject.email));
            dispatch(setUserPhone(userObject.phone));
            dispatch(setUserRole(userObject.role));
            dispatch(
              setUserLocalAuthentication(userObject.use_local_authentication)
            );
            dispatch(setUserProfileImage(userObject.image));
            dispatch(setUserTenantId(userObject.tenantId));
          }

          navigation.navigate('Home');
        } catch (error) {
          console.error(error);
          Alert.alert(
            'Login',
            'Não foi possível buscar seus dados no dispositivo, por favor, verifique sua conexão com a internet e tente novamente.'
          );
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Login',
        'Não foi possível autenticar com a biometria, por favor, verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setButtonIsLoading(false);
    }
  }

  /*async function handleSignInWithGoogle() {
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
  }*/

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enroll = await LocalAuthentication.isEnrolledAsync();

        const useLocalAuth = storageConfig.getBoolean(
          `${DATABASE_CONFIGS}.useLocalAuth`
        );
        if (compatible && enroll && useLocalAuth) {
          handleSignInWithBiometric();
        } else return;
      })();
    }, [])
  );

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
        <FooterWrapper>
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

          <Button
            title='Entrar'
            type='primary'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleSignInWithXano)}
          />

          <WrapperTextSignUp>
            <TextSignUp>
              Não tem uma conta?{' '}
              <LinkSignUp onPress={() => navigation.navigate('SignUp')}>
                Cadastre-se
              </LinkSignUp>
            </TextSignUp>
          </WrapperTextSignUp>
        </FooterWrapper>
      </Footer>
    </Container>
  );
}
