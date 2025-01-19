import React from 'react';
import {
  Container,
  DiscountPrice,
  FullPrice,
  ImgContainer,
  PriceContainer,
  TrialAdvice,
} from './styles';

import { PackageProps } from '@interfaces/premiumPackage';

import theme from '@themes/theme';

type Props = {
  data: PackageProps;
  onPress: () => void;
};

export function PremiumPackageListItem({ data, onPress }: Props) {
  function getReccurencyStringDate() {
    switch (data.packageType) {
      case 'ANNUAL':
        return 'Ano ';
      case 'SIX_MONTH':
        return '6 meses ';
      case 'MONTHLY':
        return 'Mês ';
      case 'CUSTOM':
        return 'Mês ';
      default:
        return 'Mês ';
    }
  }

  function getTrialPeriod() {
    if (!!data.product.introPrice) {
      let periodUnit: string;
      switch (data.product.introPrice.periodUnit) {
        case 'DAY':
          periodUnit = 'dias';
          break;
        case 'WEEK':
          periodUnit = 'semanas';
          break;
        case 'MONTH':
          periodUnit = 'meses';
        case 'YEAR':
          periodUnit = 'anos';
          break;
        default:
          periodUnit = 'dias';
          break;
      }

      const trialPeriod = `${data.product.introPrice.periodNumberOfUnits} ${periodUnit}`;
      return trialPeriod;
    }
  }

  return (
    <Container onPress={onPress}>
      <ImgContainer></ImgContainer>

      <PriceContainer>
        <DiscountPrice style={{ fontFamily: theme.fonts.medium }}>
          {data.product.priceString}/{getReccurencyStringDate()}
          {data.packageType === 'ANNUAL' && (
            <DiscountPrice style={{ fontSize: 11 }}>(-16%)</DiscountPrice>
          )}
          {data.packageType === 'SIX_MONTH' && (
            <DiscountPrice style={{ fontSize: 11 }}>(-8%)</DiscountPrice>
          )}
          {data.packageType === 'CUSTOM' && (
            <DiscountPrice style={{ fontSize: 11 }}>(Pré-pago)</DiscountPrice>
          )}
        </DiscountPrice>
      </PriceContainer>

      {data.product.introPrice && (
        <TrialAdvice>Com {getTrialPeriod()} de teste grátis</TrialAdvice>
      )}
    </Container>
  );
}
