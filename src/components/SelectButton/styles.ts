import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton)`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  padding: 16px;
`;

export const IconContainer = styled.View`
  max-width: 10%;
`;

export const TitleContainer = styled.View`
  padding-left: 8px;

`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleContainer = styled.View`
  flex-direction: row;
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  padding-right: 16px;
  color: ${({ theme }) => theme.colors.text};
`;
