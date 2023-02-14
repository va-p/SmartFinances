import React, { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import {
  Container,
  ContentScroll,
  Title
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';
import { Header } from '@components/Header';

import { selectUserId } from '@slices/userSlice';

import { COLLECTION_USERS } from '@configs/database';

import api from '@api/api';

import theme from '@themes/theme';

export function OptionsMenu({ navigation }: any) {
  const [localAuthIsEnabled, setLocalAuthIsEnabled] = useState(false);
  const toggleSwitch = () => setLocalAuthIsEnabled(previousState => !previousState);
  const userId = useSelector(selectUserId);

  function handleOpenAccounts() {
    navigation.navigate('Contas');
  };

  function handleOpenCategories() {
    navigation.navigate('Categorias');
  };

  function handleOpenTags() {
    navigation.navigate('Etiquetas');
  };

  function handleClickHelpCenter() {
    navigation.navigate('Central de Ajuda');
  };

  function handleClickContactSupport() {
    Linking.openURL('mailto:contato@solucaodigital.tech')
  };

  function handleClickTermsOfUse() {
    navigation.navigate('Termos de Uso');
  };

  function handleClickPrivacyPolicy() {
    navigation.navigate('Politica de Privacidade');
  };

  async function handleChangeUseLocalAuth() {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticar com Biometria",
        cancelLabel: "Cancelar",
      });
      if (biometricAuth.success) {
        toggleSwitch();

        try {
          const { status } = await api.post('edit_use_local_auth', {
            user_id: userId,
            use_local_authentication: localAuthIsEnabled ? false : true
          })
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert("Autenticação biométrica", error.response?.data.message);
          }
        };

        try {
          const loggedInUserDataFormatted = {
            useLocalAuth: localAuthIsEnabled ? false : true
          }
          await AsyncStorage.mergeItem(COLLECTION_USERS, JSON.stringify(loggedInUserDataFormatted));
        } catch (error) {
          console.log(error);
          Alert.alert("Autenticação biométrica", `${error}`);
        };
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Autenticação biométrica", "Não foi possível autenticar com a biometria, por favor, verifique sua conexão com a internet e tente novamente.");
    }
  };

  useFocusEffect(useCallback(() => {
    (async () => {
      const userData = await AsyncStorage.getItem(COLLECTION_USERS);
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        if (userDataParsed.useLocalAuth) {
          setLocalAuthIsEnabled(userDataParsed.useLocalAuth);
        }
      }
    })();
  }, []));

  return (
    <Container>
      <Header type='secondary' title="Mais opções" />
      
      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon='wallet-outline'
          title="Contas Manuais"
          color={theme.colors.primary}
          onPress={() => handleOpenAccounts()}
        />

        <SelectButton
          icon='grid-outline'
          title="Categorias"
          color={theme.colors.primary}
          onPress={() => handleOpenCategories()}
        />

        <SelectButton
          icon='pricetags-outline'
          title="Etiquetas"
          color={theme.colors.primary}
          onPress={() => handleOpenTags()}
        />

        <Title>Configurações</Title>
        <ButtonToggle
          icon='finger-print-outline'
          title="Touch / Face ID"
          color={theme.colors.primary}
          onValueChnage={handleChangeUseLocalAuth}
          value={localAuthIsEnabled}
          isEnabled={localAuthIsEnabled}
        />

        <Title>Sobre</Title>
        <SelectButton
          icon='help-buoy-outline'
          title="Central de Ajuda"
          color={theme.colors.primary}
          onPress={() => handleClickHelpCenter()}
        />

        <SelectButton
          icon='chatbubbles-outline'
          title="Contatar Suporte"
          color={theme.colors.primary}
          onPress={() => handleClickContactSupport()}
        />

        <SelectButton
          icon='shield-checkmark-outline'
          title="Termos de Uso"
          color={theme.colors.primary}
          onPress={() => handleClickTermsOfUse()}
        />

        <SelectButton
          icon='hand-left-outline'
          title="Política de Privacidade"
          color={theme.colors.primary}
          onPress={() => handleClickPrivacyPolicy()}
        />
      </ContentScroll>
    </Container>
  );
}