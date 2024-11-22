import React from 'react';
import { Container } from './styles';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import theme from '@themes/theme';

export function SkeletonBudgetsScreen() {
  return (
    <Container>
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

        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item marginTop={16}>
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={100} height={20} />
            <SkeletonPlaceholder.Item width={400} height={40} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </Container>
  );
}
