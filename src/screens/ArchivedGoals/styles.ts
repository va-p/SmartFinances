import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px 20px' : '0 16px'};
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const ArchivedRow = styled.View`
  margin-bottom: 8px;
`;

export const UnarchiveButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: flex-end;
  padding: 4px 8px;
`;

export const UnarchiveText = styled.Text`
  margin-left: 4px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;
