import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding-top: 16px;
  padding-horizontal: 16px;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.background};
`;
