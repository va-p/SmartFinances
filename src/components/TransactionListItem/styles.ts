import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';

import { TransactionTypeProps } from '@interfaces/transactions';

const RectButtonAnimated = Animated.createAnimatedComponent(RectButton);

type Props = {
  type: TransactionTypeProps;
};

export const Container = styled(RectButtonAnimated)`
  flex: 1;
  min-height: 72px;
  max-height: 104px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.borders.borderRadiusShape};
`;

export const IconContainer = styled.View`
  width: 10%;
  height: 100%;
`;

export const Icon = styled(Ionicons)<Props>`
  position: absolute;
  font-size: ${RFValue(20)}px;
  color: ${({ theme, type }) =>
    type === 'CREDIT' ? theme.colors.success : theme.colors.primary};
`;

export const DetailsContainer = styled.View`
  width: 90%;
  height: 100%;
`;

export const DescriptionAndAmountContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Description = styled.Text.attrs({
  // numberOfLines: 2,
  // ellipsizeMode: 'tail',
})<Props>`
  max-width: 75%;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ type, theme }) =>
    type === 'CREDIT' ? theme.colors.success : theme.colors.text};
`;

export const AmountContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TransferDirectionIcon = styled(Ionicons)`
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Amount = styled.Text<Props>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
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
  max-width: 80%;
  padding: 0 4px;
`;

export const Category = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  max-width: 60%;
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const CategoryAndAccountSeparator = styled.Text.attrs({
  numberOfLines: 1,
})`
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Account = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  max-width: 52%;
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const AmountNotConvertedContainer = styled.View``;

export const AmountNotConverted = styled.Text`
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const TagsContainer = styled.View`
  padding-top: 4px;
`;
