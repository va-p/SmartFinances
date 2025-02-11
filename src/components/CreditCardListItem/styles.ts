import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  min-width: 300px;
  max-width: 300px;
  min-height: 150px;
  max-height: 150px;
  justify-content: space-between;
  padding: 30px 30px 25px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 20px;
  /* box-shadow: ${({ theme }) => theme.colors.overlay} 0 1px 20px; */
`;

export const AmountContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const NameContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.title};
`;
