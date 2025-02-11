import React, { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  Button,
  ButtonsContainer,
  Container,
  AnimatedButton,
  Icon,
  Title,
  TransactionTypeProps,
} from './styles';

import {
  runOnJS,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export type TabButtonType = {
  title: string;
};

type Props = {
  buttons: TabButtonType[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
};

const icons = {
  up: 'arrow-up-circle-outline',
  swap: 'swap-vertical-outline',
  down: 'arrow-down-circle-outline',
};

export function TransactionTypeButton({
  buttons,
  selectedTab,
  setSelectedTab,
}: Props) {
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
          let type: TransactionTypeProps;
          switch (index) {
            case 0:
              type = 'down';
              break;
            case 1:
              type = 'swap';
              break;
            case 2:
              type = 'up';
              break;
            default:
              type = 'down';
              break;
          }
          const isActive = selectedTab === index;

          return (
            <Button
              key={index}
              isActive={isActive}
              onPress={() => onTabPress(index)}
            >
              <Icon name={icons[type]} type={type} isActive={isActive} />
              <Title>{button.title}</Title>
            </Button>
          );
        })}
      </ButtonsContainer>
    </Container>
  );
}
