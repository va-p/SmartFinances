import React, { ReactNode, useEffect } from 'react';
import { Container, Header, Line, Content } from './styles';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';

import { useTheme } from 'styled-components';

import { ThemeProps } from '@interfaces/theme';

const AnimatedContent = Animated.createAnimatedComponent(Content);

const COLLAPSE_DURATION = 300;

type Props = {
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/**
 * Minimalist accordion (——— v ———). Controlled: the parent owns `expanded`
 * and flips it through `onToggle`. The chevron rotates 180 degrees between
 * collapsed (v) and expanded (^) and the content mounts/unmounts with fade
 * transitions.
 */
export function Accordion({ expanded, onToggle, children }: Props) {
  const theme = useTheme() as ThemeProps;

  const caretProgress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    caretProgress.value = withTiming(expanded ? 1 : 0, {
      duration: COLLAPSE_DURATION,
    });
  }, [expanded, caretProgress]);

  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${caretProgress.value * 180}deg` }],
  }));

  return (
    <Container>
      <Header
        testID='accordion-header'
        onPress={onToggle}
        accessibilityRole='button'
        accessibilityLabel='Mais opções'
        accessibilityState={{ expanded }}
      >
        <Line />
        <Animated.View testID='accordion-caret' style={caretStyle}>
          <CaretDownIcon size={16} color={theme.colors.text} />
        </Animated.View>
        <Line />
      </Header>

      {expanded && (
        <AnimatedContent
          testID='accordion-content'
          entering={FadeInUp}
          exiting={FadeOutUp}
        >
          {children}
        </AnimatedContent>
      )}
    </Container>
  );
}
