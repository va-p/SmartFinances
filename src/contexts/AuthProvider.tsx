import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

import axios from 'axios';
import { useRevenueCat } from '@providers/RevenueCatProvider';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUser as useClerkUser, getClerkInstance } from '@clerk/clerk-expo';

import {
  DATABASE_CONFIGS,
  DATABASE_TOKENS,
  DATABASE_USERS,
  storageConfig,
  storageToken,
  storageUser,
} from '@database/database';

import { useUser } from '@storage/userStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';

import api from '@api/api';

import { User } from '@interfaces/user';

type FormData = {
  email: string;
  password: string;
};

interface AuthContextType {
  user: any;
  isSignedIn: boolean;
  isLoaded: boolean;
  loading: boolean;
  signInWithXano: (data: FormData) => Promise<User | undefined>;
  signInWithBiometrics: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CLERK_WEBHOOK_DELAY = 4000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: any) {
  const {
    user: clerkUser,
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
  } = useClerkUser();

  const { user: revenueCatUser } = useRevenueCat();
  const premium = revenueCatUser.premium;

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [biometricAttempted, setBiometricAttempted] = useState(false);
  const [biometricSupportedAndEnabled, setBiometricSupportedAndEnabled] =
    useState(false);

  const clerk = getClerkInstance();

  function storageUserDataAndConfig(userData: any): User {
    // User Data
    const loggedInUserDataFormatted = {
      id: userData.id,
      name: userData.name,
      lastName: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      image: userData.image,
      profileImage: userData.profile_image,
      premium,
      configs: {
        useLocalAuth: userData.use_local_authentication,
        hideAmount: userData.hide_amount,
        insights: userData.insights,
      },
    };
    storageUser.set(
      `${DATABASE_USERS}`,
      JSON.stringify(loggedInUserDataFormatted)
    );
    useUser.setState(() => ({
      id: loggedInUserDataFormatted.id,
      name: loggedInUserDataFormatted.name,
      lastName: loggedInUserDataFormatted.lastName,
      email: loggedInUserDataFormatted.email,
      phone: loggedInUserDataFormatted.phone,
      role: loggedInUserDataFormatted.role,
      profileImage: loggedInUserDataFormatted.image,
      premium: loggedInUserDataFormatted.premium,
    }));

    // User Configs
    storageConfig.set(
      `${DATABASE_CONFIGS}.useLocalAuth`,
      userData.use_local_authentication
    );
    storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, userData.hide_amount);
    storageConfig.set(`${DATABASE_CONFIGS}.insights`, userData.insights);
    storageConfig.set(`${DATABASE_CONFIGS}.skipWelcomeScreen`, true);
    useUserConfigs.setState(() => ({
      useLocalAuth: userData.use_local_authentication,
      hideAmount: userData.hide_amount,
      insights: userData.insights,
    }));

    return loggedInUserDataFormatted;
  }

  async function checkBiometric() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const useLocalAuth = storageConfig.getBoolean(
      `${DATABASE_CONFIGS}.useLocalAuth`
    );

    if (compatible && enrolled && useLocalAuth && !clerkSignedIn) {
      setBiometricSupportedAndEnabled(true);
    }
  }

  useEffect(() => {
    if (!biometricAttempted) {
      checkBiometric().then(() => {
        if (biometricSupportedAndEnabled) {
          setBiometricAttempted(true);
          signInWithBiometrics();
        }
      });
    }
  }, [biometricAttempted, biometricSupportedAndEnabled, signInWithBiometrics]);

  useEffect(() => {
    async function fetchClerkUserDataOnXano() {
      try {
        setLoading(true);

        // Delay of few seconds, to Clerk webhook finish request to Xano
        setTimeout(async () => {
          const { data, status } = await api.get('/auth/clerk_sso', {
            params: {
              clerk_user_id: clerkUser?.id!,
            },
          });

          if (!!data[0] && status === 200) {
            // User token
            storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(data[0]));

            const loggedInUserDataFormatted = storageUserDataAndConfig(data[1]);

            setIsSignedIn(clerkSignedIn!);
            setUser(loggedInUserDataFormatted);
            return;
          } else {
            await clerk.signOut();

            Alert.alert(
              'Erro ao autenticar com o Google',
              'Usuário não encontrado. Por favor, tente novamente.'
            );
            return;
          }
        }, CLERK_WEBHOOK_DELAY);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário =>', error);
        if (axios.isAxiosError(error)) {
          Alert.alert('Login', error.response?.data?.message);
        }
      } finally {
        setLoading(false);
      }
    }

    if (clerkLoaded && clerkSignedIn && clerkUser) {
      fetchClerkUserDataOnXano();
    }
  }, [clerkLoaded, clerkSignedIn, clerkUser]);

  async function signInWithXano(formData: FormData) {
    try {
      setLoading(true);

      const SignInUser = {
        email: formData.email,
        password: formData.password,
      };

      const { data, status } = await api.post('auth/login', SignInUser);
      const xanoToken = data.authToken || null;
      if (status === 200) {
        storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(xanoToken));

        const userData = (await api.get('auth/me')).data;

        const loggedInUserDataFormatted = storageUserDataAndConfig(userData);

        setIsSignedIn(true);
        setUser(loggedInUserDataFormatted); // User data from Xano
        return loggedInUserDataFormatted;
      }
      return;
    } catch (error) {
      console.error('AuthProvider, signInWithXano error =>', error);
      Alert.alert('Login', `${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithBiometrics() {
    try {
      setLoading(true);

      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entrar com Biometria',
        cancelLabel: 'Cancelar',
      });
      if (biometricAuth.success) {
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

          useUser.setState(() => ({
            id: userObject.id,
            name: userObject.name,
            lastName: userObject.lastName,
            email: userObject.email,
            phone: userObject.phone,
            role: userObject.role,
            profileImage: userObject.image,
          }));

          useUserConfigs.setState(() => ({
            insights: userConfigObject.insights,
            hideAmount: userConfigObject.hideAmount,
            useLocalAuth: userConfigObject.useLocalAuth,
          }));

          setIsSignedIn(true);
          setUser(userObject);
        }
      }
    } catch (error) {
      console.error('AuthProvider, signInWithBiometrics error =>', error);
      Alert.alert(
        'Login',
        `Não foi possível autenticar com a biometria: ${error.response?.data?.message}. Por favor, tente novamente.`
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await clerk.signOut();

      setIsSignedIn(false);
      setUser(null);

      // Clears MMKV storage
      storageUser.set(`${DATABASE_USERS}`, '');
      storageToken.set(`${DATABASE_TOKENS}`, '');
      storageConfig.set(`${DATABASE_CONFIGS}`, '');

      // Clears Zustand state
      useUser.setState(() => ({
        id: '',
        name: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'user',
        profileImage: '',
      }));
      useUserConfigs.setState(() => ({
        insights: false,
        hideAmount: false,
        useLocalAuth: false,
      }));
    } catch (error) {
      console.error('AuthProvider, signOut error =>', error);
      Alert.alert(
        'Logout',
        `Não foi possível sair: ${error.response?.data?.message}. Por favor, tente novamente.`
      );
    } finally {
      setLoading(false);
    }
  }

  const contextValue = {
    user,
    isSignedIn,
    loading,
    isLoaded: clerkLoaded,
    signInWithXano,
    signInWithBiometrics,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
