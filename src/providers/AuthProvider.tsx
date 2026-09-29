import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
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

const MAX_SSO_RETRIES = 3;
const SSO_RETRY_DELAY = 1500;

// SecureStore keys for persistent (survives app kill) biometric re-auth tokens
const SECURE_REFRESH_TOKEN_KEY = 'smartfinances_refresh_token';
const SECURE_USER_EMAIL_KEY = 'smartfinances_user_email';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: any) {
  const {
    user: clerkUser,
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
  } = useClerkUser();

  const { user: revenueCatUser } = useRevenueCat();
  const {premium} = revenueCatUser;

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
        notificationsEnabled: userData.notifications_enabled,
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
    storageConfig.set(
      `${DATABASE_CONFIGS}.notificationsEnabled`,
      userData.notifications_enabled
    );
    useUserConfigs.setState(() => ({
      useLocalAuth: userData.use_local_authentication,
      hideAmount: userData.hide_amount,
      insights: userData.insights,
      notificationsEnabled: userData.notifications_enabled,
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
        // Read refresh token from SecureStore (survives app kill)
        const storedRefreshToken = await SecureStore.getItemAsync(
          SECURE_REFRESH_TOKEN_KEY
        );

        if (!storedRefreshToken) {
          Alert.alert(
            'Login',
            'Sessão expirada. Por favor, faça o login novamente.'
          );
          return;
        }

        // Call backend to exchange refresh token for a new JWT
        const { data, status } = await api.post('/auth/refresh', {
          refreshToken: storedRefreshToken,
        });

        if (status === 200 && data.authToken && data.user) {
          // Store new JWT
          storageToken.set(
            `${DATABASE_TOKENS}`,
            JSON.stringify(data.authToken)
          );

          const loggedInUserDataFormatted =
            storageUserDataAndConfig(data.user);

          setIsSignedIn(true);
          setUser(loggedInUserDataFormatted);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Refresh token expired — clear it so user must login in again
        await SecureStore.deleteItemAsync(SECURE_REFRESH_TOKEN_KEY);
        Alert.alert(
          'Login',
          'Sessão expirada. Por favor, faça o login novamente.'
        );
      } else {
        Alert.alert(
          'Login',
          'Não foi possível autenticar com a biometria. Por favor, tente novamente.'
        );
      }
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

    // Not signed in — stop loading so the login screen renders.
    // Biometric is auto-triggered by the SignIn screen, not here.
    if (!isSignedIn) {
      setLoading(false);
    }
  }, [clerkLoaded, clerkSignedIn]);

  async function fetchClerkUserDataOnDatabase() {
    if (!clerkUser || !clerkSignedIn) {
      return;
    }

    for (let attempt = 0; attempt < MAX_SSO_RETRIES; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop -- sequential retry attempts are the point of the loop
        const { data, status } = await api.get('/auth/clerk_sso', {
          params: { clerk_user_id: clerkUser.id },
        });

        if (!!data[0] && status === 200) {
          storageToken.set(`${DATABASE_TOKENS}`, JSON.stringify(data[0]));

          // Store refresh token from SSO response (3rd array element)
          if (data[2]) {
            SecureStore.setItemAsync(SECURE_REFRESH_TOKEN_KEY, data[2]);
            const userEmail = data[1]?.email || '';
            if (userEmail) {
              SecureStore.setItemAsync(SECURE_USER_EMAIL_KEY, userEmail);
            }
          }

          const loggedInUserDataFormatted = storageUserDataAndConfig(data[1]);
          setIsSignedIn(clerkSignedIn);
          setUser(loggedInUserDataFormatted);
          return;
        }

        // If we got a 200 but no data, that's unexpected — retry
      } catch (error: any) {
        // If it's a server error (5xx), retry after delay
        if (error?.response?.status >= 500 && attempt < MAX_SSO_RETRIES - 1) {
          // eslint-disable-next-line no-await-in-loop -- retry backoff must be sequential
          await new Promise((resolve) => {
            setTimeout(resolve, SSO_RETRY_DELAY);
          });
        } else {
          // For other errors or last attempt, don't retry
          break;
        }
      }
    }

    // All attempts failed
    await clerk.signOut();
    Alert.alert(
      'Erro',
      'Não foi possível completar a autenticação. Por favor, tente novamente.'
    );
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

        // Persist refresh token for biometric re-auth after app restart
        if (data.refreshToken) {
          await SecureStore.setItemAsync(
            SECURE_REFRESH_TOKEN_KEY,
            data.refreshToken
          );
          await SecureStore.setItemAsync(
            SECURE_USER_EMAIL_KEY,
            formData.email
          );
        }

        const userData = (await api.get('auth/me')).data;

        const loggedInUserDataFormatted = storageUserDataAndConfig(userData);

        setIsSignedIn(true);
        setUser(loggedInUserDataFormatted); // User data from database
        return loggedInUserDataFormatted;
      }
    } catch (error) {
      Alert.alert('Login', `${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }

    return undefined;
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

      // Clears SecureStore (refresh token for biometric re-auth)
      await SecureStore.deleteItemAsync(SECURE_REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_USER_EMAIL_KEY);

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
        notificationsEnabled: false,
      }));
    } catch (error) {
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
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert('Login', error.response?.data?.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clerkLoaded, clerkSignedIn, clerkUser]);

  const contextValue = useMemo(
    () => ({
      isSignedIn,
      user,
      loading,
      isLoaded: clerkLoaded,
      signInWithEmail,
      canSignInWithBiometrics,
      signInWithBiometrics,
      signOut,
    }),
    [
      isSignedIn,
      user,
      loading,
      clerkLoaded,
      signInWithEmail,
      canSignInWithBiometrics,
      signInWithBiometrics,
      signOut,
    ]
  );

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
