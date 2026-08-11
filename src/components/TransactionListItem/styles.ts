import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';

import { TransactionTypeProps } from '@interfaces/transactions';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

type Props = {
  type: TransactionTypeProps;
};

export const Container = styled(RectButtonAnimated)`
  flex: 1;
  min-height: 64px;
  max-height: 104px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.borders.borderRadiusShape};
`;

export const IconContainer = styled.View`
  width: 10%;
  height: 100%;
`;

export const Icon = styled(Ionicons)<Props>`
  position: absolute;
  font-size: 24px;
  color: ${({ theme, type }) =>
    type === 'CREDIT' ? theme.colors.success : theme.colors.primary};
`;

export const DetailsContainer = styled.View`
  width: 90%;
  height: 100%;
`;

export const DescriptionAndAmountContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Description = styled.Text.attrs({})<Props>`
  max-width: 70%;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ type, theme }) =>
    type === 'CREDIT' ? theme.colors.success : theme.colors.text};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TransferDirectionIcon = styled(Ionicons)`
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.text};
`;

export const Amount = styled.Text<Props>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ type, theme }) =>
    type === 'CREDIT' ? theme.colors.success : theme.colors.text};
  margin-left: 4px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const CategoryAndAccountContainer = styled.View`
  flex-direction: row;
  min-width: 80%;
  max-width: 80%;
`;

export const Category = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  max-width: 60%;
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const CategoryAndAccountSeparator = styled.Text.attrs({
  numberOfLines: 1,
})`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const Account = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  min-width: 52%;
  max-width: 52%;
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountNotConvertedContainer = styled.View``;

export const AmountNotConverted = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.text};
`;

export const TagsContainer = styled.View`
  padding-top: 4px;
`;

export const RecurrenceBadge = styled.View`
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`;
