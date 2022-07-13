import { useState } from 'react';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';

import {
  COLLECTION_TOKENS,
  COLLECTION_USERS
} from '@configs/database';

import api from '@api/api';

interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  tenantId?: string;
  photo?: string;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

export const loadStoredUserData = async () => {
  const jsonUserData = await AsyncStorage.getItem(COLLECTION_USERS);
  if (jsonUserData) {
    const loggedInUserDataFormatted = JSON.parse(jsonUserData);
  };
};

async function signInWithXano(SignInUser: any) {
  const loginForm = {
    email: SignInUser.email,
    password: SignInUser.password
  }

  try {
    const { data, status } = await api.post('auth/login', loginForm);
    if (status === 200) {
      try {
        await AsyncStorage.setItem(COLLECTION_TOKENS, JSON.stringify(data.authToken));
      } catch (error) {
        console.error(error);
        Alert.alert(`Erro: ${error}`);
      }
    } else {
      Alert.alert("Login", "Credenciais inválidas, tente novamente.");
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

  } catch (error: any) {
    console.error(error);
    Alert.alert("Login", "Credenciais inválidas, tente novamente.");
  }
};

async function signInWithGoogle() {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  try {
    const RESPONSE_TYPE = 'token';
    const SCOPE = encodeURI('profile email');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

    const { type, params } = await AuthSession
      .startAsync({ authUrl }) as AuthorizationResponse;

    if (type === 'success') {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
      const userInfo = await response.json();

      const userLogged = {
        id: userInfo.id,
        name: userInfo.given_name,
        email: userInfo.email,
        photo: userInfo.picture
      };

      setUser(userLogged);
      await AsyncStorage.setItem(COLLECTION_USERS, JSON.stringify(userLogged));
    }
  } catch (error: any) {
    throw new Error(error);
  }
};

async function signInWithApple() {
  const [user, setUser] = useState<User>({} as User);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ]
    });

    if (credential) {
      const userLogged = {
        id: String(credential.user),
        email: credential.email!,
        name: credential.fullName!.givenName!,
        photo: undefined
      };

      setUser(userLogged);
      await AsyncStorage.setItem(COLLECTION_USERS, JSON.stringify(userLogged));
    }
  } catch (error: any) {
    throw new Error(error);
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem(COLLECTION_TOKENS);
  await AsyncStorage.removeItem(COLLECTION_USERS);
};

export { signInWithXano }