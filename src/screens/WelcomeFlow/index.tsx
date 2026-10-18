import React, { ComponentType, useState } from 'react';

import { Container, StepContent } from './styles';

import { StepIndicator } from '@components/StepIndicator';
import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';

import { Welcome } from '@screens/Welcome';
import { WelcomeBaseCurrency } from '@screens/WelcomeBaseCurrency';

export type WelcomeStepProps = {
  // Advance to the next step. Undefined on the last (auth) step, which owns
  // its own actions (Login / Criar conta).
  onNext?: () => void;
};

export type WelcomeStep = {
  key: string;
  Component: ComponentType<WelcomeStepProps>;
};

// Ordered onboarding steps: the brand/intro step (Welcome) comes first and
// the base-currency selection + auth step is always the terminal step (AD-004).
// Future educational screens are new entries between them - the shell needs
// no change.
export const WELCOME_STEPS: WelcomeStep[] = [
  { key: 'welcome', Component: Welcome },
  { key: 'base-currency', Component: WelcomeBaseCurrency },
];

type Props = {
  steps?: WelcomeStep[];
};

export function WelcomeFlow({ steps = WELCOME_STEPS }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  const lastIndex = steps.length - 1;
  const currentStep = activeStep > lastIndex ? lastIndex : activeStep;
  const { Component: ActiveStep } = steps[currentStep];

  function handleSelectStep(index: number) {
    setActiveStep(Math.min(Math.max(index, 0), lastIndex));
  }

  function handleNext() {
    handleSelectStep(currentStep + 1);
  }

  return (
    <Screen>
      <Gradient />

      <Container>
        <StepIndicator
          count={steps.length}
          active={currentStep}
          onSelect={(index) => handleSelectStep(index)}
          testID='welcome-step'
        />

        <StepContent testID='welcome-step-content'>
          <ActiveStep
            onNext={currentStep < lastIndex ? handleNext : undefined}
          />
        </StepContent>
      </Container>
    </Screen>
  );
}
