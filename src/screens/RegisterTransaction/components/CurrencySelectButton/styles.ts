import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled(RectButton)`
  width: 60px;
  min-height: 25px;
  max-height: 25px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background-color: ${({ theme }) => theme.colors.overlay10};
  border-radius: 15px;
`;

type TitleProps = {
  size?: number;
};
export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ size }) => (size ? RFValue(size) : RFValue(14))};
  color: ${({ theme }) => theme.colors.text};
`;

type IconProps = {
  size?: number;
};
export const Icon = styled(Ionicons)<IconProps>`
  font-size: ${({ size }) => (size ? RFValue(size) : RFValue(14))};
  padding-left: 5px;
  color: ${({ theme }) => theme.colors.text};
`;
