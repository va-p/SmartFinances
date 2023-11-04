import React from 'react';
import { View } from 'react-native';
import {
  Container,
  Header,
  Title,
  Body,
  Tag,
  Footer,
  AddTagButton,
} from './styles';

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
        <Title>
          <View
            style={{
              width: '30%',
              height: '100%',
              opacity: 0.5,
              backgroundColor: theme.colors.background,
            }}
          />
        </Title>
      </Header>

      <Body>
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
            height={120}
            noMargin
            style={{ marginBottom: 16, backgroundColor: theme.colors.shape }}
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
            style={{
              marginBottom: 16,
              backgroundColor: theme.colors.background,
            }}
          />
        </Placeholder>
      </Body>

      <Footer>
        <AddTagButton>
          <View
            style={{
              height: '100%',
              backgroundColor: theme.colors.shape,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                width: '20%',
                height: '100%',
                opacity: 0.5,
                backgroundColor: theme.colors.background,
              }}
            />
          </View>
        </AddTagButton>
      </Footer>
    </Container>
  );
}
