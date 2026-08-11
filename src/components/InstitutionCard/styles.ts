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
  padding: 16px 8px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const DetailsContainer = styled.View`
  min-width: 95%;
  max-width: 95%;
  flex-direction: row;
  align-items: center;
`;

export const IconContainer = styled.View`
  margin-right: 12px;
`;

export const NameContainer = styled.View`
  min-width: 95%;
  max-width: 95%;
`;

export const NameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const Name = styled.Text.attrs({
  numberOfLines: 2,
  ellipsizeMode: 'tail',
})`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const AccountCountBadge = styled.View`
  padding: 1px 6px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const AccountCountText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.textPlaceholder};
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;
