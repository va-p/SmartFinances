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

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as LocalAuthentication from 'expo-local-authentication';

import { Button } from '@components/Button';
import { ControlledInput } from '@components/Form/ControlledInput';

import LogoSvg from '@assets/logo.svg';

import {
  DATABASE_CONFIGS,
  DATABASE_TOKENS,
  DATABASE_USERS,
  storageConfig,
  storageToken,
  storageUser,
} from '@database/database';

import { useUser } from 'src/storage/userStorage';
import { useUserConfigs } from 'src/storage/userConfigsStorage';

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
  const setUseLocalAuth = useUserConfigs((state) => state.setUseLocalAuth);
  const setHideAmount = useUserConfigs((state) => state.setHideAmount);
  const setInsights = useUserConfigs((state) => state.setInsights);

  const setTenantId = useUser((state) => state.setTenantId);
  const setId = useUser((state) => state.setId);
  const setName = useUser((state) => state.setName);
  const setLastName = useUser((state) => state.setLastName);
  const setEmail = useUser((state) => state.setEmail);
  const setPhone = useUser((state) => state.setPhone);
  const setRole = useUser((state) => state.setRole);
  const setProfileImage = useUser((state) => state.setProfileImage);

  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  async function handleSignInWithXano(form: FormData) {
    try {
      setButtonIsLoading(true);

      const SignInUser = {
        email: form.email,
        password: form.password,
      };

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

      const userData = (await api.get('auth/me')).data;

      // User Data
      const loggedInUserDataFormatted = {
        id: userData.id,
        name: userData.name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        image: userData.image,
        tenantId: userData.tenant_id,
      };
      storageUser.set(
        `${DATABASE_USERS}`,
        JSON.stringify(loggedInUserDataFormatted)
      );
      setTenantId(loggedInUserDataFormatted.tenantId);
      setId(loggedInUserDataFormatted.id);
      setName(loggedInUserDataFormatted.name);
      setLastName(loggedInUserDataFormatted.lastName);
      setEmail(loggedInUserDataFormatted.email);
      setPhone(loggedInUserDataFormatted.phone);
      setRole(loggedInUserDataFormatted.role);
      setProfileImage(loggedInUserDataFormatted.image);

      // User Configs
      storageConfig.set(
        `${DATABASE_CONFIGS}.useLocalAuth`,
        userData.use_local_authentication
      );
      storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, userData.hide_amount);
      storageConfig.set(`${DATABASE_CONFIGS}.insights`, userData.insights);
      setUseLocalAuth(userData.use_local_authentication);
      setHideAmount(userData.hide_amount);
      setInsights(userData.insights);

      navigation.navigate('Main');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Login', error.response?.data.message);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleSignInWithBiometric() {
    try {
      setButtonIsLoading(true);
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entrar com Biometria',
        cancelLabel: 'Cancelar',
      });
      if (biometricAuth.success) {
        try {
          const jsonUser = storageUser.getString('user');

          const useLocalAuth = storageConfig.getBoolean(
            `${DATABASE_CONFIGS}.useLocalAuth`
          );
          const hideAmount = storageConfig.getBoolean(
            `${DATABASE_CONFIGS}.hideAmount`
          );
          const insights = storageConfig.getBoolean(
            `${DATABASE_CONFIGS}.insights`
          );
          const userConfigObject = {
            useLocalAuth: useLocalAuth || false,
            hideAmount: hideAmount || false,
            insights: insights || false,
          };
          if (jsonUser && userConfigObject) {
            const userObject = JSON.parse(jsonUser);

            setTenantId(userObject.tenantId);
            setId(userObject.id);
            setName(userObject.name);
            setLastName(userObject.lastName);
            setEmail(userObject.email);
            setPhone(userObject.phone);
            setRole(userObject.role);
            setProfileImage(userObject.image);

            setUseLocalAuth(userConfigObject.useLocalAuth);
            setHideAmount(userConfigObject.hideAmount);
            setInsights(userConfigObject.insights);
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
