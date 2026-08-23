import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  flex: 1;
  min-height: 64px;
  max-height: 72px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const DetailsContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-right: 8px;
`;

export const NameContainer = styled.View`
  flex: 1;
`;

export const Name = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const PaymentDate = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.text};
`;

export const RightContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;
