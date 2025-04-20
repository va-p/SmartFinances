import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Advice,
  AdvicesContainer,
  Container,
  Description,
  PackagesContainer,
  PremiumBenefitsContainer,
  Title,
} from './styles';

import formatDatePtBr from '@utils/formatDatePtBr';

import { Header } from '@components/Header';
import { Benefit } from './components/Benefit';
import { PremiumPackageListItem } from '@components/PremiumPackageListItem';

import { addDays } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';
import { Gradient } from '@components/Gradient';
import { useFocusEffect } from '@react-navigation/native';
import { PurchasesPackage } from 'react-native-purchases';

import { useRevenueCat } from '@providers/RevenueCatProvider';

import { PackageProps } from '@interfaces/premiumPackage';

import { eUrl } from '@enums/enumsUrl';

export function PremiumBenefits() {
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(
    formatDatePtBr(new Date()).extensive
  );

  const { packages, purchasePackage, restorePurchasesUser } = useRevenueCat();
  // console.log('packages !! =======>', packages);

  // console.log(
  //   'package[0].product.introPrice =======->',
  //   packages[0].product.introPrice
  // );
  // console.log(
  //   'package[3].product.introPrice =======->',
  //   packages[3].product.introPrice
  // );

  async function handlePurchase(pack: PurchasesPackage) {
    await purchasePackage(pack);
  }

  async function handleClickPrivacyPolicy() {
    await WebBrowser.openBrowserAsync(eUrl.PRIVACY_POLICY_URL);
  }

  async function handleClickTermsOfUse() {
    await WebBrowser.openBrowserAsync(eUrl.TERMS_OF_USE_URL);
  }

  useFocusEffect(
    useCallback(() => {
      function getSubscriptionEndDate() {
        const subscriptionEndDate = addDays(new Date(), 14);
        const subscriptionEndDateFormatted =
          formatDatePtBr(subscriptionEndDate).extensive;
        setSubscriptionEndDate(subscriptionEndDateFormatted);
      }

      getSubscriptionEndDate();
    }, [])
  );

  return (
    <Container>
      <Gradient />

      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Escolha seu plano'} />
      </Header.Root>

      <Title>Smart Finances Premium</Title>

      <Description>
        Comece a economizar seu tempo e dinheiro para o que realmente importa na
        sua vida!
      </Description>

      <PremiumBenefitsContainer>
        <Benefit description={'Dicas personalizadas'} />

        <Benefit description={'Sincronização de contas bancárias'} />

        <Benefit description={'Sincronização de cartões de crédito'} />

        <Benefit description={'Insights gerados com Inteligência Artificial'} />

        <Benefit
          description={
            'Categorização das transações com Inteligência Artificial'
          }
        />
      </PremiumBenefitsContainer>

      <ScrollView contentContainerStyle={{ justifyContent: 'space-between' }}>
        <PackagesContainer>
          {packages.map((pack, idx) => (
            <PremiumPackageListItem
              key={idx}
              data={pack as PackageProps}
              onPress={() => handlePurchase(pack)}
            />
          ))}
        </PackagesContainer>

        <AdvicesContainer>
          <Advice>
            Você pode cancelar sua assinatura a qualquer momento durante o
            período de testes. O período de testes expirará em{' '}
            {subscriptionEndDate}.
          </Advice>

          <Advice>
            Já assinou o Smart Finances?{' '}
            <Advice
              style={{ textDecorationLine: 'underline' }}
              onPress={async () => await restorePurchasesUser()}
            >
              Restaurar assinatura
            </Advice>
            .
          </Advice>

          <Advice>
            Ao comprar a assinatura do Smart Finances, você aceita a nossa{' '}
            <Advice
              style={{ textDecorationLine: 'underline' }}
              onPress={handleClickPrivacyPolicy}
            >
              Política de Privacidade
            </Advice>{' '}
            e nossos{' '}
            <Advice
              style={{ textDecorationLine: 'underline' }}
              onPress={handleClickTermsOfUse}
            >
              Termos de Uso.
            </Advice>
          </Advice>
        </AdvicesContainer>
      </ScrollView>
    </Container>
  );
}
