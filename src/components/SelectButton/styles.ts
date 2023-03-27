import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled(RectButton)`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleContainer = styled.View`
  flex-direction: row;
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  padding-right: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

export const IconChevronDown = styled(Ionicons)`
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.text};
`;
