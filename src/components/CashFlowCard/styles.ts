import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Card = styled.View`
  width: 400px;
  align-items: center;
  padding: 17px 0;
  margin-right: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${RFPercentage(1)}px;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  margin-top: ${RFPercentage(1)}px;
`;

export const HideBalanceButton = styled(BorderlessButton)``;