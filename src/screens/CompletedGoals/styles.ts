import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px 20px' : '0 16px'};
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;
