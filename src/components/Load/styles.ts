import styled from 'styled-components/native';

import { ActivityIndicator } from 'react-native';

import theme from '@themes/theme';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Indicator = styled(
  ActivityIndicator
).attrs({
  color: theme.colors.primary
})``;