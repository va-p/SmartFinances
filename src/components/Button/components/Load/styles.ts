import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { TypeProps } from '@components/Button/styles';
import { ThemeProps } from '@interfaces/theme';

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
    color: type === 'primary' ? (theme as ThemeProps).colors.textLight : (theme as ThemeProps).colors.primary,
  })
)``;
