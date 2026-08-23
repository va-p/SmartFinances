import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px' : '8px 16px'};
  background-color: ${({ theme }) => theme.colors.background};
`;
