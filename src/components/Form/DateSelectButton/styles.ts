import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type ColorProps = {
  color: string;
}

export const Container = styled(RectButton).attrs({
  activeOpacity: 0.7
})`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
`;

export const Icon = styled(Ionicons) <ColorProps>`
  font-size: ${RFValue(20)}px;
  margin-right: 15px;
  color: ${({ color }) => color};
`;

export const Description = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
`;

export const IconChevronDown = styled(Ionicons)`
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.text};
`;