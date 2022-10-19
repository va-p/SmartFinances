import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled(RectButton)`
  width: 100%;
  height: 112px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(40)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;