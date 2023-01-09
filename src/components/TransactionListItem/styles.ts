import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type TransactionProps = {
  type: 'credit' | 'debit' | 'transferDebit' | 'transferCredit';
}

export const Container = styled(RectButton)`
  flex: 1;
  min-height: 70px;
  max-height: 70px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

export const IconContainer = styled.View`
  width: 10%;
  height: 100%;
`;

export const Icon = styled(Ionicons) <TransactionProps>`
  position: absolute;
  font-size: ${RFValue(20)}px;
  color: ${({ theme, type }) =>
    type === 'credit' ? theme.colors.success : theme.colors.primary};
`;

export const DetailsContainer = styled.View`
  width: 90%;
  height: 100%;
`;

export const DescriptionAndAmountContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Description = styled.Text <TransactionProps>`
  max-width: 80%;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ type, theme }) =>
    type === 'credit' ? theme.colors.success : theme.colors.title};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TransferDirectionIcon = styled(Ionicons)`
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Amount = styled.Text <TransactionProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ type, theme }) =>
    type === 'credit' ? theme.colors.success : theme.colors.text};
  margin-left: 5px;
`;

export const LabelContainer = styled.View``;

export const Footer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const CategoryAndAccountContainer = styled.View`
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

export const AmountNotConvertedContainer = styled.View`
  align-items: flex-end;
`;

export const AmountNotConverted = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;