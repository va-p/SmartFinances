import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';

type CheckedProps = {
  isChecked?: boolean;
};

type ColorProps = {
  color: string;
};

export const Container = styled(RectButton)`
  flex: 1;
  align-items: center;
`;

export const Category = styled.View<CheckedProps>`
  width: 50px;
  min-height: 50px;
  max-height: 50px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, isChecked }) =>
    isChecked ? theme.colors.primary : theme.colors.shape};
  border-radius: 30px;
`;

export const Icon = styled(Ionicons)<ColorProps>`
  font-size: ${RFValue(25)}px;
  color: ${({ color }) => color};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;
