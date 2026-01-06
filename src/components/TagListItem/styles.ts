import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Tag = styled(RectButtonAnimated)`
  flex: 1;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.title};
`;
