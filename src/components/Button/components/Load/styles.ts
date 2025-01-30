import styled from 'styled-components/native';

import { ActivityIndicator } from 'react-native';

import { TypeProps } from '@components/Button/styles';

type IndicatorProps = {
  type: TypeProps;
};

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Indicator = styled(ActivityIndicator).attrs<IndicatorProps>(
  ({ theme, type }) => ({
    color: type === 'primary' ? theme.colors.textLight : theme.colors.primary,
  })
)``;
