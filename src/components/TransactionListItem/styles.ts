import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type TransactionProps = {
  type: 'income' | 'outcome' | 'transfer';
}

export const Container = styled.View`
  flex: 1;
`;

export const Content = styled(RectButton)`
  width: 100%;
  min-height: 70px;
  max-height: 70px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

export const IconContainer = styled.View`
  width: 10%;
  height: 110%;
`;

export const Icon = styled(Ionicons) <TransactionProps>`
  font-size: ${RFValue(20)}px;
  color: ${({ theme, type }) =>
    type === 'income' ? theme.colors.success : theme.colors.secondary};
`;

export const DetailsContainer = styled.View`
  width: 90%;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Description = styled.Text<TransactionProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  ${({ type }) => type === 'income' && css`
    color: ${({ theme }) => theme.colors.success};
  `};
  ${({ type }) => type === 'outcome' && css`
    color: ${({ theme }) => theme.colors.text_dark};
  `};
  ${({ type }) => type === 'transfer' && css`
    color: ${({ theme }) => theme.colors.text};
  `};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TransferDirectionIcon = styled(Ionicons)`
font-size: ${RFValue(14)}px;
color: ${({ theme, type }) => theme.colors.text};
`;

export const Amount = styled.Text<TransactionProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  ${({ type }) => type === 'income' && css`
    color: ${({ theme }) => theme.colors.success};
  `};
  ${({ type }) => type === 'outcome' && css`
    color: ${({ theme }) => theme.colors.text_dark};
  `};
  ${({ type }) => type === 'transfer' && css`
    color: ${({ theme }) => theme.colors.text};
  `};
  margin-left: 5px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Details = styled.View`
  flex-direction: row;
`;

export const Category = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Account = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountConvertedContainer = styled.View`
  align-items: flex-end;
`;

export const AmountConverted = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Date = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;