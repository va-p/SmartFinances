import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '24px 0 0' : '8px 0 0'};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Footer = styled.View`
  padding: 0 16px 16px;
`;
