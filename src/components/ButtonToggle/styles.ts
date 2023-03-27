import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleContainer = styled.View`
  flex-direction: row;
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  padding-right: 10px;
  color: ${({ theme }) => theme.colors.text};
`;
