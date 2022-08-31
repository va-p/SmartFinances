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
  background-color: ${({ theme }) => theme.colors.overlay_light};
  border-radius: 15px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.background};
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(14)}px;
  padding-left: 5px;
  color: ${({ theme }) => theme.colors.background};
`;