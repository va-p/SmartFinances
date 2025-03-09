import React from 'react';
import {
  Container,
  PremiumBenefit,
  PremiumBenefitIcon,
  PremiumBenefitDescription,
} from './styles';

interface Benefit {
  description: string;
}

export function Benefit({ description }: Benefit) {
  return (
    <Container>
      <PremiumBenefit>
        <PremiumBenefitIcon />
        <PremiumBenefitDescription>{description}</PremiumBenefitDescription>
      </PremiumBenefit>
    </Container>
  );
}
