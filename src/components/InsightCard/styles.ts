import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  margin: 16px 0;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 8px;
`;

export const CloseInsightButton = styled(BorderlessButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export const TitleContainer = styled.View`
  align-items: center;
`;

export const InsightTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;

export const InsightText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;
