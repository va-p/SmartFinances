import React from 'react';
import { Container } from './styles';

import { useTheme } from 'styled-components';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { Gradient } from '@components/Gradient';

import { ThemeProps } from '@interfaces/theme';

export function SkeletonCategoriesAndTagsScreen() {
  const theme: ThemeProps = useTheme();

  return (
    <Container>
      <Gradient />

      <SkeletonPlaceholder
        highlightColor={theme.colors.overlay}
        backgroundColor={theme.colors.shape}
      >
        <SkeletonPlaceholder.Item
          alignItems='center'
          justifyContent='center'
          marginBottom={50}
        >
          <SkeletonPlaceholder.Item width={80} height={20} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={6}
        >
          <SkeletonPlaceholder.Item width={10} height={50} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={50} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={12}
        >
          <SkeletonPlaceholder.Item width={10} height={50} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={50} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={12}
        >
          <SkeletonPlaceholder.Item width={10} height={50} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={50} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={12}
        >
          <SkeletonPlaceholder.Item width={10} height={50} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={50} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={12}
        >
          <SkeletonPlaceholder.Item width={10} height={50} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={50} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='center'
          marginTop={12}
        >
          <SkeletonPlaceholder.Item width={10} height={40} marginRight={6} />
          <SkeletonPlaceholder.Item width={400} height={40} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </Container>
  );
}
