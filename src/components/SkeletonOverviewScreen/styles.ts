import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  padding: ${Platform.OS === 'ios' ? '24px 16px 16px' : '16px'};
  background-color: ${({ theme }) => theme.colors.background};
`;
