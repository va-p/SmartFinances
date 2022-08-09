import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;  
`;

export const ContentScroll = styled.ScrollView``;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  padding-top: 10px;
  padding-left: 10px;
  color: ${({ theme }) => theme.colors.text_dark};
`;