import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '24px 0 0' : '12px 0 0'};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ContentScroll = styled.ScrollView``;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  padding-top: 16px;
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.title};
`;
