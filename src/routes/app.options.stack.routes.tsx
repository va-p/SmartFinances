import React from 'react';

import { useTheme } from 'styled-components';
import { createStackNavigator } from '@react-navigation/stack';

import { Tags } from '@screens/Tags';
import { Profile } from '@screens/Profile';
import { Categories } from '@screens/Categories';
import { OptionsMenu } from '@screens/OptionsMenu';
import { AccountsList } from '@screens/AccountsList';
import { PremiumBenefits } from '@screens/PremiumBenefits';
import { BankingIntegrations } from '@screens/BankingIntegrations';
import { BankingIntegrationDetails } from '@screens/BankingIntegrationDetails';

import { ThemeProps } from '@interfaces/theme';
import { RootParamList } from 'src/@types/navigation';

const { Navigator, Screen } = createStackNavigator<RootParamList>();

export function AppOptionsStackRoutes() {
  const theme: ThemeProps = useTheme();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Screen name='Mais Opções' component={OptionsMenu} />

      <Screen name='Perfil' component={Profile} />

      <Screen name='Assinatura' component={PremiumBenefits} />

      <Screen name='Contas' component={AccountsList} />

      <Screen name='Integrações Bancárias' component={BankingIntegrations} />

      <Screen
        name='Integração Bancária'
        component={BankingIntegrationDetails}
      />

      <Screen name='Categorias' component={Categories} />

      <Screen name='Etiquetas' component={Tags} />
    </Navigator>
  );
}
