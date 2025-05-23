import React from 'react';
import { Container } from './styles';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import theme from '@themes/theme';
import { Gradient } from '@components/Gradient';

export function SkeletonAccountsScreen() {
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
          marginBottom={12}
        >
          <SkeletonPlaceholder.Item width={80} height={20} />
          <SkeletonPlaceholder.Item width={50} height={20} marginTop={8} />
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          marginTop={6}
          width={400}
          height={80}
          borderRadius={5}
          marginBottom={60}
        />

        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item flexDirection='row'>
            <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
            <SkeletonPlaceholder.Item justifyContent='center'>
              <SkeletonPlaceholder.Item width={300} height={20} />
              <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection='row' marginTop={20}>
          <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={300} height={20} />
            <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection='row' marginTop={20}>
          <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={300} height={20} />
            <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection='row' marginTop={20}>
          <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={300} height={20} />
            <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection='row' marginTop={20}>
          <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={300} height={20} />
            <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection='row' marginTop={20}>
          <SkeletonPlaceholder.Item width={50} height={50} marginRight={8} />
          <SkeletonPlaceholder.Item justifyContent='center'>
            <SkeletonPlaceholder.Item width={300} height={20} />
            <SkeletonPlaceholder.Item width={200} height={20} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </Container>
  );
}
