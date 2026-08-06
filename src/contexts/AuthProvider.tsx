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

import { useUser } from '@stores/userStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';

import api from '@api/api';

import { User } from '@interfaces/user';

type FormData = {
  email: string;
  password: string;
};

interface AuthContextType {
  isSignedIn: boolean;
  user: any;
  isLoaded: boolean;
  loading: boolean;
  signInWithEmail: (data: FormData) => Promise<User | undefined>;
  canSignInWithBiometrics: () => Promise<boolean>;
  signInWithBiometrics: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CLERK_WEBHOOK_DELAY = 4000;
const MAX_SSO_RETRIES = 3;
const SSO_RETRY_DELAY = 3000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: any) {
  const {
    user: clerkUser,
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
  } = useClerkUser();

  const { user: revenueCatUser } = useRevenueCat();
  const premium = revenueCatUser.premium;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  async function canSignInWithBiometrics(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const useLocalAuth = storageConfig.getBoolean(
        `${DATABASE_CONFIGS}.useLocalAuth`
      );

      return (compatible && enrolled && useLocalAuth) || false;
    } catch (error) {
      console.error('Erro ao verificar biometria:', error);
      return false;
    }
  }

  async function signInWithBiometrics() {
    try {
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
    }
  }

  useEffect(() => {
    if (!clerkLoaded) {
      if (!loading) setLoading(true);
      return;
    }

    if (clerkSignedIn) {
      return;
    }

    const attemptBiometricLogin = async () => {
      const canUseBiometrics = await canSignInWithBiometrics();
      if (canUseBiometrics) {
        await signInWithBiometrics();
      }
    };

    if (!isSignedIn) {
      setLoading(false);
    }

    attemptBiometricLogin();
  }, [clerkLoaded, clerkSignedIn]);

  async function fetchClerkUserDataOnDatabase() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Delay to allow Clerk webhook to reach the backend
        setTimeout(async () => {
          let lastError: any = null;

          for (let attempt = 0; attempt < MAX_SSO_RETRIES; attempt++) {
            try {
              const { data, status } = await api.get('/auth/clerk_sso', {
                params: { clerk_user_id: clerkUser?.id! },
              });

              if (!!data[0] && status === 200) {
                storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(data[0]));
                const loggedInUserDataFormatted = storageUserDataAndConfig(data[1]);
                setIsSignedIn(clerkSignedIn!);
                setUser(loggedInUserDataFormatted);
                resolve();
                return;
              }

              // If we got a 200 but no data, that's unexpected — retry
              lastError = new Error('Empty response from auth/clerk_sso');
            } catch (error: any) {
              lastError = error;

              // If it's a 503 (webhook still processing), retry after delay
              if (error?.response?.status === 503 && attempt < MAX_SSO_RETRIES - 1) {
                console.log(
                  `SSO fetch attempt ${attempt + 1} failed (webhook pending), retrying in ${SSO_RETRY_DELAY}ms...`
                );
                await new Promise((r) => setTimeout(r, SSO_RETRY_DELAY));
                continue;
              }

              // For other errors or last attempt, don't retry
              break;
            }
          }

          // All attempts failed
          console.error('All SSO fetch attempts failed:', lastError);
          await clerk.signOut();
          Alert.alert(
            'Erro',
            'Não foi possível completar a autenticação. Por favor, tente novamente.'
          );
          resolve();
        }, CLERK_WEBHOOK_DELAY);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário =>', error);
        reject(error);
      }
    });
  }

  async function signInWithEmail(formData: FormData) {
    try {
      setLoading(true);

      const SignInUser = {
        email: formData.email,
        password: formData.password,
      };

      const { data, status } = await api.post('auth/login', SignInUser);
      const token = data.authToken || null;
      if (status === 200) {
        storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(token));

        const userData = (await api.get('auth/me')).data;

        const loggedInUserDataFormatted = storageUserDataAndConfig(userData);

        setIsSignedIn(true);
        setUser(loggedInUserDataFormatted); // User data from database
        return loggedInUserDataFormatted;
      }
      return;
    } catch (error) {
      console.error('AuthProvider, signInWithEmail error =>', error);
      Alert.alert('Login', `${error.response?.data?.message}`);
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

  useEffect(() => {
    const initializeAuth = async () => {
      if (!clerkLoaded) {
        return;
      }

      try {
        if (clerkSignedIn && clerkUser) {
          await fetchClerkUserDataOnDatabase();
        } else {
          const canUseBiometrics = await canSignInWithBiometrics();
          if (canUseBiometrics) {
            await signInWithBiometrics();
          }
        }
      } catch (error) {
        console.error('Erro durante a inicialização da autenticação:', error);
        if (axios.isAxiosError(error)) {
          Alert.alert('Login', error.response?.data?.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clerkLoaded, clerkSignedIn, clerkUser]);

  const contextValue = {
    isSignedIn,
    user,
    loading,
    isLoaded: clerkLoaded,
    signInWithEmail,
    canSignInWithBiometrics,
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
