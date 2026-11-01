import { StyleSheet, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View``;

export const Header = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-vertical: 12px;
`;

export const Line = styled.View`
  flex: 1;
  height: ${StyleSheet.hairlineWidth}px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.border};
`;

export const Content = styled.View`
  padding-bottom: 4px;
`;
