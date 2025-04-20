import React from 'react';
import { Alert, Linking } from 'react-native';
import { Container, ContentScroll, Title } from './styles';

// Icons
import Tag from 'phosphor-react-native/src/icons/Tag';
import User from 'phosphor-react-native/src/icons/User';
import Plugs from 'phosphor-react-native/src/icons/Plugs';
import Cookie from 'phosphor-react-native/src/icons/Cookie';
import Trophy from 'phosphor-react-native/src/icons/Trophy';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import Sparkle from 'phosphor-react-native/src/icons/Sparkle';
import Lifebuoy from 'phosphor-react-native/src/icons/Lifebuoy';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import CirclesFour from 'phosphor-react-native/src/icons/CirclesFour';
import Fingerprint from 'phosphor-react-native/src/icons/Fingerprint';
import ShieldCheck from 'phosphor-react-native/src/icons/ShieldCheck';

import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';

import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';

import { useUser } from 'src/storage/userStorage';
import { useUserConfigs } from 'src/storage/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import api from '@api/api';

import theme from '@themes/theme';

import { eUrl } from '@enums/enumsUrl';

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

  function handleOpenSubscription() {
    navigation.navigate('Assinatura');
  }

  function handleOpenAccounts() {
    navigation.navigate('Contas');
  }

  function handleOpenConnectedAccounts() {
    navigation.navigate('Integrações Bancárias', {
      showHeader: true,
    });
  }

  function handleOpenCategories() {
    navigation.navigate('Categorias');
  }

  function handleOpenTags() {
    navigation.navigate('Etiquetas');
  }

  async function handleClickHelpCenter() {
    await WebBrowser.openBrowserAsync(eUrl.HELP_CENTER_URL);
  }

  async function handleClickTermsOfUse() {
    await WebBrowser.openBrowserAsync(eUrl.TERMS_OF_USE_URL);
  }

  async function handleClickPrivacyPolicy() {
    await WebBrowser.openBrowserAsync(eUrl.PRIVACY_POLICY_URL);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      Alert.alert(
        'Ocultar informações',
        'Não foi possível alterar a configuração, por favor, tente novamente.'
      );
    }
  }

  return (
    <Container>
      <Gradient />

      <Header.Root style={{ justifyContent: 'center' }}>
        <Header.Title title='Mais opções' />
      </Header.Root>

      <ContentScroll>
        <Title>Conta</Title>
        <SelectButton
          icon={<User color={theme.colors.primary} />}
          title='Perfil'
          onPress={() => handleOpenProfile()}
        />

        <SelectButton
          icon={<Trophy color={theme.colors.primary} />}
          title='Assinatura Premium'
          onPress={() => handleOpenSubscription()}
        />

        <SelectButton
          icon={<Wallet color={theme.colors.primary} />}
          title='Contas Manuais'
          onPress={() => handleOpenAccounts()}
        />

        <SelectButton
          icon={<Plugs color={theme.colors.primary} />}
          title='Integrações Bancárias'
          onPress={() => handleOpenConnectedAccounts()}
        />

        <SelectButton
          icon={<CirclesFour color={theme.colors.primary} />}
          title='Categorias'
          onPress={() => handleOpenCategories()}
        />

        <SelectButton
          icon={<Tag color={theme.colors.primary} />}
          title='Etiquetas'
          onPress={() => handleOpenTags()}
        />

        <Title>Configurações</Title>
        <ButtonToggle
          icon={<Sparkle color={theme.colors.primary} />}
          title='Insights Inteligentes'
          onValueChange={handleChangeSmartInsights}
          value={insights}
          isEnabled={insights}
        />

        <ButtonToggle
          icon={<Fingerprint color={theme.colors.primary} />}
          title='Touch / Face ID'
          onValueChange={handleChangeUseLocalAuth}
          value={useLocalAuth}
          isEnabled={useLocalAuth}
        />

        <ButtonToggle
          icon={<EyeSlash color={theme.colors.primary} />}
          title='Ocultar informações'
          onValueChange={handleChangeHideAmount}
          value={hideAmount}
          isEnabled={hideAmount}
        />

        <Title>Sobre</Title>
        <SelectButton
          icon={<Lifebuoy color={theme.colors.primary} />}
          title='Central de Ajuda'
          onPress={() => handleClickHelpCenter()}
        />

        <SelectButton
          icon={<ShieldCheck color={theme.colors.primary} />}
          title='Termos de Uso'
          onPress={() => handleClickTermsOfUse()}
        />

        <SelectButton
          icon={<Cookie color={theme.colors.primary} />}
          title='Política de Privacidade'
          onPress={() => handleClickPrivacyPolicy()}
        />
      </ContentScroll>
    </Container>
  );
}
