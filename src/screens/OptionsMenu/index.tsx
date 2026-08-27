import React from 'react';
import { Alert } from 'react-native';
import { Container, ContentScroll, Title } from './styles';

// Icons
import {TagIcon} from 'phosphor-react-native/src/icons/Tag';
import {BankIcon} from 'phosphor-react-native/src/icons/Bank';
import {UserIcon} from 'phosphor-react-native/src/icons/User';
import {BellIcon} from 'phosphor-react-native/src/icons/Bell';
import {PlugsIcon} from 'phosphor-react-native/src/icons/Plugs';
import {CookieIcon} from 'phosphor-react-native/src/icons/Cookie';
import {TrophyIcon} from 'phosphor-react-native/src/icons/Trophy';
import {WalletIcon} from 'phosphor-react-native/src/icons/Wallet';
import {SparkleIcon} from 'phosphor-react-native/src/icons/Sparkle';
import {SignOutIcon} from 'phosphor-react-native/src/icons/SignOut';
import {ReceiptIcon} from 'phosphor-react-native/src/icons/Receipt';
import {LifebuoyIcon} from 'phosphor-react-native/src/icons/Lifebuoy';
import {EyeSlashIcon} from 'phosphor-react-native/src/icons/EyeSlash';
import {MoonStarsIcon} from 'phosphor-react-native/src/icons/MoonStars';
import {CertificateIcon} from 'phosphor-react-native/src/icons/Certificate';
import {CirclesFourIcon} from 'phosphor-react-native/src/icons/CirclesFour';
import {FingerprintIcon} from 'phosphor-react-native/src/icons/Fingerprint';
import {ShieldCheckIcon} from 'phosphor-react-native/src/icons/ShieldCheck';

// Dependencies
import axios from 'axios';
import { reloadAppAsync } from 'expo';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import * as WebBrowser from 'expo-web-browser';
import { OneSignal } from 'react-native-onesignal';
import * as LocalAuthentication from 'expo-local-authentication';

// Screens
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';

// Storages, providers
import { useUser } from '@stores/userStorage';
import { useAuth } from '@providers/AuthProvider';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import api from '@api/api';

// Interfaces
import { eUrl } from '@enums/enumsUrl';
import { ThemeProps } from '@interfaces/theme';

export function OptionsMenu() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();

  const userId = useUser((state) => state.id);

  const {
    hideAmount,
    setHideAmount,
    darkMode,
    setDarkMode,
    insights,
    setInsights,
    useLocalAuth,
    setUseLocalAuth,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useUserConfigs();

  const { signOut } = useAuth();

  function handleOpenProfile() {
    router.navigate('/options/profile');
  }

  function handleOpenSubscription() {
    router.navigate('/options/subscription');
  }

  function handleOpenInstitutions() {
    router.navigate('/options/institutions');
  }

  function handleOpenAccounts() {
    router.navigate('/options/accountsList');
  }

  function handleOpenConnectedAccounts() {
    router.navigate({
      pathname: '/options/bankingIntegrations',
      params: {
        showHeader: true,
      },
    });
  }

  function handleOpenCategories() {
    router.navigate('/options/categories');
  }

  function handleOpenTags() {
    router.navigate('/options/tags');
  }

  function handleOpenGoals() {
    router.navigate('/options/goals');
  }

  function handleOpenSubscriptionsList() {
    router.navigate('/options/subscriptions');
  }

  async function handleOpenkHelpCenter() {
    await WebBrowser.openBrowserAsync(eUrl.HELP_CENTER_URL);
  }

  async function handleOpenTermsOfUse() {
    await WebBrowser.openBrowserAsync(eUrl.TERMS_OF_USE_URL);
  }

  async function handleOpenPrivacyPolicy() {
    await WebBrowser.openBrowserAsync(eUrl.PRIVACY_POLICY_URL);
  }

  function handleOpenDevScreen() {
    router.navigate('/options/dev');
  }

  async function handleChangeHideAmount() {
    try {
      const { status } = await api.patch(`user/${userId}/configs`, {
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

  async function handleChangeDarkMode() {
    try {
      storageConfig.set(`${DATABASE_CONFIGS}.darkMode`, !darkMode);
      setDarkMode(!darkMode);
      await reloadAppAsync();
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Modo escuro',
        'Não foi possível alterar o modo escuro, por favor, tente novamente.'
      );
    }
  }

  async function handleChangeSmartInsights() {
    try {
      const { status } = await api.patch(`user/${userId}/configs`, {
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

  async function handleChangeUseLocalAuth() {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar com Biometria',
        cancelLabel: 'Cancelar',
      });
      if (biometricAuth.success) {
        try {
          const { status } = await api.patch(`user/${userId}/configs`, {
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

  async function handleChangeNotifications() {
    try {
      if (!notificationsEnabled) {
        // Turning ON: request OS permission
        const granted =
          await OneSignal.Notifications.requestPermission(true);
        if (!granted) {
          Alert.alert(
            'Notificações',
            'Permissão negada. Ative as notificações nas configurações do dispositivo.'
          );
          return;
        }
      }

      const { status } = await api.patch(`user/${userId}/configs`, {
        notifications_enabled: !notificationsEnabled,
      });

      if (status === 200) {
        storageConfig.set(
          `${DATABASE_CONFIGS}.notificationsEnabled`,
          !notificationsEnabled
        );
        setNotificationsEnabled(!notificationsEnabled);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Notificações',
        'Não foi possível alterar a configuração, por favor, tente novamente.'
      );
    }
  }

  async function handleLogout() {
    try {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: async () => await signOut() },
        ]
      );
    } catch (error) {
      console.error('handleLogout error:', error);
    }
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root style={{ justifyContent: 'center' }}>
          <Header.Title title='Mais opções' />
        </Header.Root>

        <ContentScroll>
          <Title>Conta</Title>
          <SelectButton
            icon={<UserIcon color={theme.colors.primary} />}
            title='Perfil'
            onPress={handleOpenProfile}
          />

          <SelectButton
            icon={<CertificateIcon color={theme.colors.primary} />}
            title='Smart Finances Premium'
            onPress={() => handleOpenSubscription()}
          />

          <SelectButton
            icon={<BankIcon color={theme.colors.primary} />}
            title='Instituições Bancárias'
            onPress={() => handleOpenInstitutions()}
          />

          <SelectButton
            icon={<WalletIcon color={theme.colors.primary} />}
            title='Contas Manuais'
            onPress={() => handleOpenAccounts()}
          />

          <SelectButton
            icon={<TrophyIcon color={theme.colors.primary} />}
            title='Metas & Objetivos'
            onPress={() => handleOpenGoals()}
          />

          <SelectButton
            icon={<PlugsIcon color={theme.colors.primary} />}
            title='Integrações Bancárias'
            onPress={() => handleOpenConnectedAccounts()}
          />

          <SelectButton
            icon={<CirclesFourIcon color={theme.colors.primary} />}
            title='Categorias'
            onPress={() => handleOpenCategories()}
          />

          <SelectButton
            icon={<TagIcon color={theme.colors.primary} />}
            title='Etiquetas'
            onPress={() => handleOpenTags()}
          />

          <SelectButton
            icon={<ReceiptIcon color={theme.colors.primary} />}
            title='Minhas Assinaturas'
            onPress={() => handleOpenSubscriptionsList()}
          />

          <Title>Configurações</Title>
          <ButtonToggle
            icon={<EyeSlashIcon color={theme.colors.primary} />}
            title='Ocultar informações'
            onValueChange={handleChangeHideAmount}
            value={hideAmount}
            isEnabled={hideAmount}
          />

          <ButtonToggle
            icon={<MoonStarsIcon color={theme.colors.primary} />}
            title='Modo escuro'
            onValueChange={handleChangeDarkMode}
            value={darkMode}
            isEnabled={darkMode}
          />

          <ButtonToggle
            icon={<SparkleIcon color={theme.colors.primary} />}
            title='Insights Inteligentes'
            onValueChange={handleChangeSmartInsights}
            value={insights}
            isEnabled={insights}
          />

          <ButtonToggle
            icon={<FingerprintIcon color={theme.colors.primary} />}
            title='Touch / Face ID'
            onValueChange={handleChangeUseLocalAuth}
            value={useLocalAuth}
            isEnabled={useLocalAuth}
          />

          <ButtonToggle
            icon={<BellIcon color={theme.colors.primary} />}
            title='Notificações'
            onValueChange={handleChangeNotifications}
            value={notificationsEnabled}
            isEnabled={notificationsEnabled}
          />

          <Title>Sobre</Title>
          <SelectButton
            icon={<LifebuoyIcon color={theme.colors.primary} />}
            title='Central de Ajuda'
            onPress={() => handleOpenkHelpCenter()}
          />

          <SelectButton
            icon={<ShieldCheckIcon color={theme.colors.primary} />}
            title='Termos de Uso'
            onPress={() => handleOpenTermsOfUse()}
          />

          <SelectButton
            icon={<CookieIcon color={theme.colors.primary} />}
            title='Política de Privacidade'
            onPress={() => handleOpenPrivacyPolicy()}
            onLongPress={handleOpenDevScreen}
          />

          <SelectButton
            icon={<SignOutIcon color={theme.colors.primary} />}
            title='Sair'
            onPress={() => handleLogout()}
            onLongPress={handleOpenDevScreen}
          />
        </ContentScroll>
      </Container>
    </Screen>
  );
}
