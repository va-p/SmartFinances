import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

type ColorProps = {
  color: string;
};

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const MainContent = styled.View``;

export const Header = styled.View<ColorProps>`
  min-height: ${RFPercentage(20)}px;
  max-height: ${RFPercentage(20)}px;
  align-items: center;
  padding: 16px;
  margin-bottom: 3px;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  background-color: ${({ color }) => color};
`;

export const TitleContainer = styled.View`
  width: 100%;
  min-height: ${RFPercentage(8)}px;
  max-height: ${RFPercentage(8)}px;
  flex-direction: row;
  justify-content: center;
`;

export const Title = styled.Text.attrs({
  numberOfLines: 3,
})`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: 6px 0;
`;

export const InputTransactionValuesContainer = styled.View`
  flex: 1;
`;

export const InputTransactionValueGroup = styled.View`
  min-width: 100%;
  max-width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const ContentScroll = styled.ScrollView.attrs({
  shownsVerticalScrollIndicator: false,
  contentContainerStyle: { paddingBottom: 16 },
})``;

export const TransactionImageContainer = styled.Pressable`
  padding: 0 16px 16px;
`;

export const TransactionImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 10px;
`;

export const TransactionsTypes = styled.View`
  padding: 0 16px;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 16px;
`;
