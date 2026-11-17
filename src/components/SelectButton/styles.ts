import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled(RectButton)`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;

export const IconAndTextsContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-start;
`;

export const IconContainer = styled.View`
  max-width: 10%;
`;

export const TitleContainer = styled.View`
  padding-left: 8px;

`;

export const Title = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeSubtitle};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const SubtitleContainer = styled.View`
  flex-direction: row;
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  padding-right: 16px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const CaretAndAltButtonGroup = styled.View`
  flex-direction: row;
  align-items: center;
  column-gap: 12px;
`;
