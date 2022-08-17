import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.View`
  width: 100%;
`;

export const Content = styled(RectButton)`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const DetailsContainer = styled.View`
  flex-direction: row;
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  padding-right: 10px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text_dark};
`;

export const IconChevronForward = styled(Ionicons)`
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.text};
`;