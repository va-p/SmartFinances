import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  padding: 2px 16px;
  margin-bottom: 8px;
  /* background-color: ${({ theme }) => theme.colors.shape}; */
`;

export const SectionText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.textPlaceholder};
`;
