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
import axios from 'axios';

import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';
import { Header } from '@components/Header';

import { COLLECTION_USERS } from '@configs/database';

import theme from '@themes/theme';

export function OptionsMenu({ navigation }: any) {
  const [localAuthIsEnabled, setLocalAuthIsEnabled] = useState(false);
  const toggleSwitch = () => setLocalAuthIsEnabled(previousState => !previousState);

  function handleClickCategories() {
    navigation.navigate('Categorias');
  };

  function handleClickTags() {
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
        promptMessage: "Entrar com Biometria",
        cancelLabel: "Cancelar",
      });
      if (biometricAuth.success) {
        toggleSwitch();

        const loggedInUserDataFormatted = {
          useLocalAuth: localAuthIsEnabled ? false : true
        }
        await AsyncStorage.mergeItem(COLLECTION_USERS, JSON.stringify(loggedInUserDataFormatted))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Autenticação biométrica", error.response?.data.message);
      }
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
          icon='grid-outline'
          title="Categorias"
          color={theme.colors.primary}
          onPress={() => handleClickCategories()}
        />

        <SelectButton
          icon='pricetags-outline'
          title="Etiquetas"
          color={theme.colors.primary}
          onPress={() => handleClickTags()}
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