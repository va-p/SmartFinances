import React, { useEffect } from 'react';
import {
  Container,
  Header,
  Title,
  Body,
  Tag,
  Footer,
  AddTagButton
} from './styles';

import Animated, { EasingNode } from 'react-native-reanimated';

import theme from '@themes/theme';

export function SkeletonCategoriesAndTagsScreen() {
  const skeletonAnimatedValue = new Animated.Value(0)

  const skeletonAnimated = () => {
    skeletonAnimatedValue.setValue(0)
    Animated.timing(
      skeletonAnimatedValue,
      {
        toValue: 1,
        duration: 300,
        easing: EasingNode.out(EasingNode.linear)
      }
    ).start(() => {
      setTimeout(() => {
        skeletonAnimated()
      }, 500);
    })
  };

  const translateX = skeletonAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 100]
  });
  const translateX2 = skeletonAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 380]
  });

  useEffect(() => {
    skeletonAnimated()
  }, []);

  return (
    <Container>
      <Header>
        <Title>
          <Animated.View style={{ width: '30%', height: 32, opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX }] }}></Animated.View>
        </Title>
      </Header>

      <Body>
        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>

        <Tag>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </Tag>
      </Body>

      <Footer>
        <AddTagButton>
          <Animated.View style={{ height: '100%', backgroundColor: theme.colors.shape, borderRadius: 10 }}>
            <Animated.View style={{ width: '20%', height: '100%', opacity: 0.5, backgroundColor: theme.colors.background, transform: [{ translateX: translateX2 }] }}></Animated.View>
          </Animated.View>
        </AddTagButton>
      </Footer>
    </Container>
  );
}