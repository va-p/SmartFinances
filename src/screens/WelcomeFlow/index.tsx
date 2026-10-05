import React, { ComponentType, useEffect, useState } from 'react';

import {
  Container,
  StepIndicatorContainer,
  StepBulletsRow,
  StepBullet,
  StepDash,
  STEP_DASH_STRIDE,
} from './styles';

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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

type StepIndicatorProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
};

function StepIndicator({ count, active, onSelect }: StepIndicatorProps) {
  // The active-step dash slides between the bullet positions when the
  // active step changes (BC-26).
  const dashTranslateX = useSharedValue(active * STEP_DASH_STRIDE);

  useEffect(() => {
    dashTranslateX.value = withSpring(active * STEP_DASH_STRIDE);
  }, [active, dashTranslateX]);

  const dashAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dashTranslateX.value }],
  }));

  return (
    <StepIndicatorContainer>
      <StepBulletsRow testID='welcome-step-bullets-row'>
        {Array.from({ length: count }, (_, index) => (
          <StepBullet
            key={index}
            testID={`welcome-step-bullet-${index}`}
            accessibilityRole='button'
            accessibilityLabel={`Passo ${index + 1}`}
            accessibilityState={{ selected: index === active }}
            onPress={() => onSelect(index)}
          />
        ))}

        <StepDash
          testID='welcome-step-dash'
          style={dashAnimatedStyle}
          pointerEvents='none'
        />
      </StepBulletsRow>
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
