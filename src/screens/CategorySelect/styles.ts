import styled from 'styled-components/native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type CategoryProps = {
  isActive: boolean;
}

export const Container = styled(GestureHandlerRootView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Category = styled.TouchableOpacity<CategoryProps>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: ${RFValue(15)}px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary_light : theme.colors.background
  };
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  margin-right: 16px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 24px;
`;