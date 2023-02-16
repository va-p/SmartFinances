import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

type ColorProps = {
  color: string
}

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const MainContent = styled.View``;

export const Header = styled.View <ColorProps>`
  min-height: ${RFPercentage(18)}px;
  max-height: ${RFPercentage(18)}px;
  align-items: center;
  padding: 12px;
  margin-bottom: 3px;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  background-color: ${({ color }) => color};
`;

export const TitleContainer = styled.View`
  width: 100%;
  min-height: ${RFPercentage(6)}px;
  max-height: ${RFPercentage(6)}px;
  flex-direction: row;
  justify-content: center;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.shape};
`;

export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: 6px 0;
`;

export const InputTransactionValueContainer = styled.View`
  width: 60%;
  flex-direction: row;
  align-items: center;
  margin-left: 12px;
`;

export const ContentScroll = styled.ScrollView.attrs({
  shownsVerticalScrollIndicator: false
})``;

export const ProductImageContainer = styled.View`
  padding: 0 12px 12px;
`;

export const ProductImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 10px;
`;

export const TransactionsTypes = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0 12px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const GroupButtonDateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const GroupButtonDate = styled.View`
  width: 48%;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 12px;
`;