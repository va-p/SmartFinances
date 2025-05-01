import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  padding: 8px;
  margin: 16px;
  border: 1px solid ${({ theme }) => theme.colors.overlayGray};
  border-radius: ${({ theme }) => theme.borders.borderRadiusShape};
  background-color: ${({ theme }) => theme.colors.overlayGray};
`;

export const CloseInsightButton = styled(BorderlessButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
`;

export const TitleContainer = styled.View``;

export const InsightTitle = styled.Text`
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.title};
`;

export const InsightText = styled.Text`
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;
