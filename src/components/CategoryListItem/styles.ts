import styled from 'styled-components/native';
import { Animated } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type ColorProps = {
  color: string;
}

export const Container = styled.View`
  flex: 1;
`;

export const Category = styled(RectButton)`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: ${RFValue(15)}px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  margin-right: 16px;
`;

export const Color = styled.View<ColorProps>`
  width: 20px;
  height: 20px;
  margin-right: 16px;
  background-color: ${({ color }) => color};
  border-radius: 10px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
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