import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  align-items: flex-start;
  padding: 0 8px 8px 0;
  margin: 16px 0;
  border: 1px solid ${({ theme }) => theme.colors.overlay_light2};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.overlay_light2};
`;

export const CloseInsightButton = styled(BorderlessButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export const TitleContainer = styled.View``;

export const InsightTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;

export const InsightText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  text-align: center;
  margin-top: -10px;
  color: ${({ theme }) => theme.colors.text};
`;
