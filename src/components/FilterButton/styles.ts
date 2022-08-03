import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled(RectButton)`
  width: 100%;
  min-height: 25px;
  max-height: 25px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 15px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(12)}px;
  padding-left: 5px;
  color: ${({ theme }) => theme.colors.text};
`;