import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  color: string;
  icon: string;
}

export const Container = styled.View`
  flex: 1;
`;

export const Category = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6
}) <Props>`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-left-width: 10px;
  border-left-color: ${({ color }) => color};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons) <Props>`
  font-size: ${RFValue(20)}px;
  margin-right: 8px;
  color: ${({ color }) => color};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;