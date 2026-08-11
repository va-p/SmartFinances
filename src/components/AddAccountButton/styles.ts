import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton)`
  width: 100%;
  height: 60px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons)`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;
