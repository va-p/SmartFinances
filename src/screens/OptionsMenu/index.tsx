import React from 'react';
import { Alert, Linking } from 'react-native';
import { Container, ContentScroll, Title } from './styles';

import axios from 'axios';
import * as Icon from 'phosphor-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { Header } from '@components/Header';
import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';

import { useUser } from '@stores/userStore';
import { useUserConfigs } from '@stores/userConfigsStore';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import api from '@api/api';

import theme from '@themes/theme';

export function OptionsMenu({ navigation }: any) {
  const userId = useUser((state) => state.id);

  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const setHideAmount = useUserConfigs((state) => state.setHideAmount);

  const useLocalAuth = useUserConfigs((state) => state.useLocalAuth);
  const setUseLocalAuth = useUserConfigs((state) => state.setUseLocalAuth);

  const insights = useUserConfigs((state) => state.insights);
  const setInsights = useUserConfigs((state) => state.setInsights);

  function handleOpenProfile() {
    navigation.navigate('Perfil');
  }

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
          const { status } = await api.post('edit_use_local_auth', {
            user_id: userId,
            use_local_authentication: !useLocalAuth,
          });

          if (status === 200) {
            storageConfig.set(
              `${DATABASE_CONFIGS}.useLocalAuth`,
              !useLocalAuth
            );

            setUseLocalAuth(!useLocalAuth);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert(
              'Autenticação biométrica',
              error.response?.data.message
            );
          }
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

  async function handleChangeSmartInsights() {
    try {
      const { status } = await api.post('edit_insights', {
        user_id: userId,
        insights: !insights,
      });

      if (status === 200) {
        storageConfig.set(`${DATABASE_CONFIGS}.insights`, !insights);
        setInsights(!insights);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Insights Inteligentes',
        'Não foi possível alterar a configuração, por favor, tente novamente.'
      );
    }
  }

  async function handleChangeHideAmount() {
    try {
      const { status } = await api.post('edit_hide_amount', {
        user_id: userId,
        hide_amount: !hideAmount,
      });

      if (status === 200) {
        storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, !hideAmount);
        setHideAmount(!hideAmount);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Ocultar informações',
        'Não foi possível alterar a configuração, por favor, tente novamente.'
      );
    }
  }

  return (
    <Container>
      <Header type='secondary' title='Mais opções' />

      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon={<Icon.User color={theme.colors.primary} />}
          title='Perfil'
          onPress={() => handleOpenProfile()}
        />

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
          icon={<Icon.Sparkle color={theme.colors.primary} />}
          title='Insights Inteligentes'
          onValueChange={handleChangeSmartInsights}
          value={insights}
          isEnabled={insights}
        />

        <ButtonToggle
          icon={<Icon.Fingerprint color={theme.colors.primary} />}
          title='Touch / Face ID'
          onValueChange={handleChangeUseLocalAuth}
          value={useLocalAuth}
          isEnabled={useLocalAuth}
        />

        <ButtonToggle
          icon={<Icon.EyeSlash color={theme.colors.primary} />}
          title='Ocultar informações'
          onValueChange={handleChangeHideAmount}
          value={hideAmount}
          isEnabled={hideAmount}
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
