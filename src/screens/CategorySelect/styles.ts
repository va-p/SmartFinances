import styled from 'styled-components/native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type CategoryProps = {
  isActive: boolean;
  color: string;
}

export const Container = styled(GestureHandlerRootView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Category = styled.TouchableOpacity<CategoryProps>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary_light : theme.colors.background
  };
  border-left-width: 10px;
  border-left-color: ${({ color }) => color};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons) <CategoryProps>`
  font-size: ${RFValue(20)}px;
  margin-right: 16px;
  color: ${({ color }) => color};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;

export const Footer = styled.View`
  padding: 24px;
`;