import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.shape};
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 16px;
`;

export const ImgContainer = styled.View``;

export const Img = styled.Image`
  width: 100%;
  height: 100%;
`;

export const PriceContainer = styled.View`
  flex-direction: row;
`;

export const FullPrice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  text-align: center;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.text};
`;

export const DiscountPrice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const TrialAdvice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;
