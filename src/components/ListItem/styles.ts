import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type ItemProps = {
  isActive: boolean;
}

export const Item = styled(RectButton)`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Name = styled.Text<ItemProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text
  };
`;