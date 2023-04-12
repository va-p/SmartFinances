import React, { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { Container, ContentScroll, Title } from './styles';

import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect } from '@react-navigation/native';
import * as Icon from 'phosphor-react-native';

import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';
import { Header } from '@components/Header';

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import theme from '@themes/theme';

export function OptionsMenu({ navigation }: any) {
  const [localAuthIsEnabled, setLocalAuthIsEnabled] = useState(false);

  function handleOpenAccounts() {
    navigation.navigate('Contas');
  }

  function handleOpenCategories() {
    navigation.navigate('Categorias');
  }

  function handleOpenTags() {
    navigation.navigate('Etiquetas');
  }

  function handleClickHelpCenter() {
    navigation.navigate('Central de Ajuda');
  }

  function handleClickContactSupport() {
    Linking.openURL('mailto:contato@solucaodigital.tech');
  }

  function handleClickTermsOfUse() {
    navigation.navigate('Termos de Uso');
  }

  function handleClickPrivacyPolicy() {
    navigation.navigate('Politica de Privacidade');
  }

  async function handleChangeUseLocalAuth() {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar com Biometria',
        cancelLabel: 'Cancelar',
      });
      if (biometricAuth.success) {
        try {
          storageConfig.set(
            `${DATABASE_CONFIGS}.useLocalAuth`,
            !localAuthIsEnabled
          );

          setLocalAuthIsEnabled((prevState) => !prevState);
        } catch (error) {
          console.log(error);
          Alert.alert('Autenticação biométrica', `${error}`);
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Autenticação biométrica',
        'Não foi possível autenticar com a biometria, por favor, tente novamente.'
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      (() => {
        const useLocalAuth = storageConfig.getBoolean(
          `${DATABASE_CONFIGS}.useLocalAuth`
        );
        if (useLocalAuth != undefined) {
          setLocalAuthIsEnabled(useLocalAuth);
        }
        console.log(useLocalAuth);
      })();
    }, [])
  );

  return (
    <Container>
      <Header type='secondary' title='Mais opções' />

      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon={<Icon.Wallet color={theme.colors.primary} />}
          title='Contas Manuais'
          onPress={() => handleOpenAccounts()}
        />

        <SelectButton
          icon={<Icon.CirclesFour color={theme.colors.primary} />}
          title='Categorias'
          onPress={() => handleOpenCategories()}
        />

        <SelectButton
          icon={<Icon.Tag color={theme.colors.primary} />}
          title='Etiquetas'
          onPress={() => handleOpenTags()}
        />

        <Title>Configurações</Title>
        <ButtonToggle
          icon={<Icon.Fingerprint color={theme.colors.primary} />}
          title='Touch / Face ID'
          onValueChnage={handleChangeUseLocalAuth}
          value={localAuthIsEnabled}
          isEnabled={localAuthIsEnabled}
        />

        <Title>Sobre</Title>
        <SelectButton
          icon={<Icon.Lifebuoy color={theme.colors.primary} />}
          title='Central de Ajuda'
          onPress={() => handleClickHelpCenter()}
        />

        <SelectButton
          icon={<Icon.ChatsCircle color={theme.colors.primary} />}
          title='Contatar Suporte'
          onPress={() => handleClickContactSupport()}
        />

        <SelectButton
          icon={<Icon.ShieldCheck color={theme.colors.primary} />}
          title='Termos de Uso'
          onPress={() => handleClickTermsOfUse()}
        />

        <SelectButton
          icon={<Icon.Cookie color={theme.colors.primary} />}
          title='Política de Privacidade'
          onPress={() => handleClickPrivacyPolicy()}
        />
      </ContentScroll>
    </Container>
  );
}
