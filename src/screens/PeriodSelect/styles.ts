import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type PeriodProps = {
  isActive: boolean;
}

export const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Period = styled(RectButton)`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const Icon = styled(Ionicons) <PeriodProps>`
  font-size: ${RFValue(20)}px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.success : theme.colors.background
  };
`;

export const Name = styled.Text<PeriodProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.success : theme.colors.text_dark
  };
`;