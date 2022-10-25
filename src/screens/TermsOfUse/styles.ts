import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ContentScroll = styled.ScrollView``;

export const LastUpdatedDate = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.text_light};
`;

export const Title = styled.Text`
  text-align: center;
  font-size: ${RFValue(16)}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text_light};
`;

export const SubTitle = styled.Text`
  text-align: left;
  font-size: ${RFValue(16)}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text_light};
`;

export const Text = styled.Text`
  text-align: justify;
  color: ${({ theme }) => theme.colors.text_light};
`;