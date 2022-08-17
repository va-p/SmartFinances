import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type ColorProps = {
  color: string;
}

export const Placeholder = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7
})`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${({ theme }) => theme.colors.background};
  border-radius: 30px;
`;

export const Container = styled(RectButton).attrs({
  activeOpacity: 0.7
}) <ColorProps>`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 30px;
`;

export const Description = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;

export const Icon = styled(Ionicons) <ColorProps>`
  font-size: ${RFValue(30)}px;
  color: ${({ color }) => color};
`;

export const IconChevronDown = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.text};
`;