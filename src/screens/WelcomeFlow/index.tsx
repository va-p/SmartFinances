import React, { ComponentType, useState } from 'react';

import { Container, StepIndicatorContainer, StepBullet } from './styles';

import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';

import { Welcome } from '@screens/Welcome';

export type WelcomeStepProps = {
  // Advance to the next step. Undefined on the last (auth) step, which owns
  // its own actions (Login / Criar conta).
  onNext?: () => void;
};

export type WelcomeStep = {
  key: string;
  Component: ComponentType<WelcomeStepProps>;
};

// Ordered onboarding steps: educational screens come first and the auth
// screen (Welcome - Login / Criar conta) is always the terminal step. Future
// educational screens are new entries before the auth step - the shell needs
// no change.
export const WELCOME_STEPS: WelcomeStep[] = [{ key: 'welcome', Component: Welcome }];

type Props = {
  steps?: WelcomeStep[];
};

type StepIndicatorProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
};

function StepIndicator({ count, active, onSelect }: StepIndicatorProps) {
  return (
    <StepIndicatorContainer>
      {Array.from({ length: count }, (_, index) => (
        <StepBullet
          key={index}
          testID={`welcome-step-bullet-${index}`}
          accessibilityRole='button'
          accessibilityLabel={`Passo ${index + 1}`}
          accessibilityState={{ selected: index === active }}
          isActive={index === active}
          onPress={() => onSelect(index)}
        />
      ))}
    </StepIndicatorContainer>
  );
}

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
        />

        <ActiveStep
          onNext={currentStep < lastIndex ? handleNext : undefined}
        />
      </Container>
    </Screen>
  );
}
