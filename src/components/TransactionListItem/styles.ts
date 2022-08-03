import styled from 'styled-components/native';
import { Animated } from 'react-native';

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
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 10px;
`;

export const IconContainer = styled.View`
  width: 10%;
  padding-right: 10px;
`;

export const Icon = styled(Ionicons)<TransactionProps>`
  font-size: ${RFValue(20)}px;
  color: ${({ theme, type }) =>
    type === 'income' ? theme.colors.success : theme.colors.secondary};
`;

export const DetailsContainer = styled.View`
  width: 90%;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Description = styled.Text<TransactionProps>`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, type }) =>
    type === 'income' ? theme.colors.success : theme.colors.text_dark};
`;

export const Amount = styled.Text<TransactionProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, type }) =>
    type === 'income' ? theme.colors.success : theme.colors.text_dark};
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

export const Details = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Category = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Account = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Date = styled.Text`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const DeleteButton = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: 70%;
  margin-bottom: 5px;
  background-color: ${({ theme }) => theme.colors.attention};
  border-radius: 10px;
`;

export const DeleteButtonIcon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const DeleteButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.shape};
`;