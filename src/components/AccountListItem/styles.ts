import styled from 'styled-components/native';
import { Animated } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.View`
  flex: 1;
`;

export const Content = styled(RectButton)`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
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
  font-family: ${({ theme}) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
`;

export const Simbol = styled.Text`
  font-family: ${({ theme}) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
`;

export const DeleteButton = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: 70%;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.attention};
  border-radius: 10px;
`;

export const DeleteButtonIcon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const DeleteButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.shape};
`;