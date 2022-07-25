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

export const Account = styled.TouchableOpacity<CategoryProps>`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary_light : theme.colors.background
  };
`;

export const NameContainer = styled.View``;

export const Name = styled.Text`
  font-family: ${({ theme}) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
`;

export const CurrencyContainer = styled.View`
  flex-direction: row;
`;

export const Currency = styled.Text`
  padding: 0 5px;
  font-family: ${({ theme}) => theme.fonts.bold};
  font-size: ${RFValue(14)}px;
`;

export const Simbol = styled.Text`
  font-family: ${({ theme}) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  margin-right: 16px;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 24px;
`;