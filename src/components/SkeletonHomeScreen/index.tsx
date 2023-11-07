import React from 'react';
import { Container } from './styles';

import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Shine,
} from 'rn-placeholder';
import theme from '@themes/theme';

export function SkeletonHomeScreen() {
  return (
    <Container>
      <Placeholder Animation={Shine} style={{ padding: 8, gap: 8 }}>
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
        <PlaceholderLine
          width={16}
          height={24}
          style={{ alignSelf: 'center', backgroundColor: theme.colors.shape }}
        />
        <PlaceholderLine
          width={96}
          height={88}
          style={{ backgroundColor: theme.colors.shape }}
        />
      </Placeholder>

      <Placeholder
        Animation={Shine}
        Left={() => (
          <PlaceholderMedia
            style={{ backgroundColor: theme.colors.background }}
          />
        )}
        style={{ padding: 8, gap: 8, backgroundColor: theme.colors.shape }}
      >
        <PlaceholderLine
          width={96}
          style={{ backgroundColor: theme.colors.background }}
        />
        <PlaceholderLine
          width={48}
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
        style={{ padding: 8, gap: 8, backgroundColor: theme.colors.shape }}
      >
        <PlaceholderLine
          width={96}
          style={{ backgroundColor: theme.colors.background }}
        />
        <PlaceholderLine
          width={48}
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
        style={{ padding: 8, gap: 8, backgroundColor: theme.colors.shape }}
      >
        <PlaceholderLine
          width={96}
          style={{ backgroundColor: theme.colors.background }}
        />
        <PlaceholderLine
          width={48}
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
        style={{ padding: 8, gap: 8, backgroundColor: theme.colors.shape }}
      >
        <PlaceholderLine
          width={96}
          style={{ backgroundColor: theme.colors.background }}
        />
        <PlaceholderLine
          width={48}
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
        style={{ padding: 8, gap: 8, backgroundColor: theme.colors.shape }}
      >
        <PlaceholderLine
          width={96}
          style={{ backgroundColor: theme.colors.background }}
        />
        <PlaceholderLine
          width={48}
          style={{ backgroundColor: theme.colors.background }}
        />
      </Placeholder>
    </Container>
  );
}
