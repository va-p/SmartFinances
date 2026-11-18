import styled from 'styled-components/native';

import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

export const Container = styled(RectButtonAnimated)`
  flex: 1;
  min-height: 76px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 8px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const DetailsContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const IconContainer = styled.View`
  margin-right: 12px;
`;

export const TextColumn = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 2px;
`;

export const Name = styled.Text.attrs({
  numberOfLines: 2,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const SubLine = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.textPlaceholder};
`;

export const RightColumn = styled.View`
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-left: 8px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const Profit = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.text};
`;

export const ChevronContainer = styled.View`
  margin-left: 8px;
`;
