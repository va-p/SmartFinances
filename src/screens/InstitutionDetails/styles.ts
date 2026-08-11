import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: 16px 16px 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const SummaryContainer = styled.View`
  align-items: center;
  padding: 8px 16px 16px;
`;

export const TotalBalance = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(20)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;

export const TotalBalanceDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  margin-top: -4px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AccountsList = styled.View`
  flex: 1;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.title};
`;
