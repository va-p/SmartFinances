import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  color: string;
}

export const Container = styled.TouchableOpacity<Props>`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-left-width: 10px;
  border-left-color: ${({ color }) => color};
  border-radius: 10px;
`;

export const Details = styled.View`
  flex-direction: row;
`;

export const Icon = styled(Ionicons) <Props>`
  font-size: ${RFValue(20)}px;
  margin-right: 8px;
  color: ${({ color }) => color};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(15)}px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(15)}px;
`;