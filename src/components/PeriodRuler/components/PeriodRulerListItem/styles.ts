import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';

type Props = {
  width: number;
  isActive: boolean;
};

export const Container = styled(RectButton)``;

export const PeriodRulerDate = styled.Text<Props>`
  width: ${({ width }) => width}px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  text-align: center;
  margin-right: 8px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text};
`;
