import React, { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  Button,
  ButtonsContainer,
  Container,
  AnimatedButton,
  Title,
  Description,
} from './styles';

import {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export type TabButtonType = {
  title: string;
  description: string;
};

type Props = {
  buttons: TabButtonType[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
};

export function TabButtons({ buttons, selectedTab, setSelectedTab }: Props) {
  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });

  const buttonWidth = dimensions.width / buttons.length;

  const tabPositionX = useSharedValue(0);

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const handlePress = (index: number) => {
    setSelectedTab(index);
  };

  const onTabPress = (index: number) => {
    tabPositionX.value = withTiming(buttonWidth * index, {}, () => {
      runOnJS(handlePress)(index);
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <Container>
      <AnimatedButton
        style={[
          animatedStyle,
          { width: buttonWidth - 10, height: dimensions.height - 10 },
        ]}
      />
      <ButtonsContainer onLayout={onTabBarLayout}>
        {buttons.map((button, index) => {
          const isActive = selectedTab === index;
          const isPositive =
            parseFloat(
              button.title
                .replace('R$', '')
                .replace('.', '')
                .replace(',', '.')
                .trim()
            ) > 0;

          return (
            <Button
              key={index}
              isActive={isActive}
              onPress={() => onTabPress(index)}
            >
              <Title isActive={isActive} isPositive={isPositive}>
                {button.title}
              </Title>
              {button.description && (
                <Description>{button.description}</Description>
              )}
            </Button>
          );
        })}
      </ButtonsContainer>
    </Container>
  );
}
