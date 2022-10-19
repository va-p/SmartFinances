import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

export const Overlay = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const Header = styled.View`
  width: 100%;
  height: 35px;
  margin-top: ${RFPercentage(75)}px;
  align-items: flex-start;
  padding: 5px 10px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;