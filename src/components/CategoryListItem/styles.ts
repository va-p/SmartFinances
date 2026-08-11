import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

type Props = {
  color: string;
};

const TouchableOpacityAnimated =
  Animated.createAnimatedComponent(TouchableOpacity);

export const Container = styled(TouchableOpacityAnimated).attrs({
  activeOpacity: 0.7,
})<Props>`
  flex: 1;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-left-width: 10px;
  border-left-color: ${({ color }) => color};
  border-radius: 10px;
`;

export const Icon = styled(Ionicons)<Props>`
  font-size: 20px;
  margin-right: 8px;
  color: ${({ color }) => color};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.title};
`;
