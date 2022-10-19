import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

export const Overlay = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const Header = styled.View`
  width: 100%;
  height: 60px;
  margin-top: 80px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: 24px;
  padding-left: 24px;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(24)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;