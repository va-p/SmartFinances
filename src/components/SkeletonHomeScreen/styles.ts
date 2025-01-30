import { Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '24px 16px 0' : '16px 16px 0'};
  gap: 8px;
`;
