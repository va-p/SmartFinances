import React from 'react';
import { Container, Header } from './styles';

import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Shine,
} from 'rn-placeholder';

import theme from '@themes/theme';

export function SkeletonCategoriesAndTagsScreen() {
  return (
    <Container>
      <Header>
        <Placeholder
          Animation={Shine}
          style={{ padding: 8, gap: 8, marginBottom: 80 }}
        >
          <PlaceholderLine
            width={24}
            height={32}
            noMargin
            style={{
              alignSelf: 'center',
              marginBottom: 8,
              backgroundColor: theme.colors.shape,
            }}
          />
        </Placeholder>
      </Header>

      <Placeholder Animation={Shine} style={{ marginBottom: 160 }}>
        <Placeholder
          Animation={Shine}
          Left={() => (
            <PlaceholderMedia
              style={{ backgroundColor: theme.colors.background }}
            />
          )}
          style={{
            padding: 8,
            gap: 8,
            marginBottom: 8,
            backgroundColor: theme.colors.shape,
            borderRadius: 10,
          }}
        >
          <PlaceholderLine
            width={96}
            style={{ backgroundColor: theme.colors.background }}
          />
        </Placeholder>

        <Placeholder
          Animation={Shine}
          Left={() => (
            <PlaceholderMedia
              style={{ backgroundColor: theme.colors.background }}
            />
          )}
          style={{
            padding: 8,
            gap: 8,
            marginBottom: 8,
            backgroundColor: theme.colors.shape,
            borderRadius: 10,
          }}
        >
          <PlaceholderLine
            width={96}
            style={{ backgroundColor: theme.colors.background }}
          />
        </Placeholder>

        <Placeholder
          Animation={Shine}
          Left={() => (
            <PlaceholderMedia
              style={{ backgroundColor: theme.colors.background }}
            />
          )}
          style={{
            padding: 8,
            gap: 8,
            marginBottom: 8,
            backgroundColor: theme.colors.shape,
            borderRadius: 10,
          }}
        >
          <PlaceholderLine
            width={96}
            style={{ backgroundColor: theme.colors.background }}
          />
        </Placeholder>

        <Placeholder
          Animation={Shine}
          Left={() => (
            <PlaceholderMedia
              style={{ backgroundColor: theme.colors.background }}
            />
          )}
          style={{
            padding: 8,
            gap: 8,
            marginBottom: 8,
            backgroundColor: theme.colors.shape,
            borderRadius: 10,
          }}
        >
          <PlaceholderLine
            width={96}
            style={{ backgroundColor: theme.colors.background }}
          />
        </Placeholder>

        <Placeholder
          Animation={Shine}
          Left={() => (
            <PlaceholderMedia
              style={{ backgroundColor: theme.colors.background }}
            />
          )}
          style={{
            padding: 8,
            gap: 8,
            backgroundColor: theme.colors.shape,
            borderRadius: 10,
          }}
        >
          <PlaceholderLine
            width={96}
            style={{ backgroundColor: theme.colors.background }}
          />
        </Placeholder>
      </Placeholder>

      <Placeholder
        height={56}
        Animation={Shine}
        style={{
          alignItems: 'center',
          padding: 8,
          backgroundColor: theme.colors.shape,
          borderRadius: 10,
        }}
      >
        <PlaceholderLine
          width={50}
          style={{
            alignSelf: 'center',
            backgroundColor: theme.colors.background,
          }}
        />
      </Placeholder>
    </Container>
  );
}
