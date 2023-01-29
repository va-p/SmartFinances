import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const TagsContainer = styled.View`
  height: ${RFPercentage(80)}px;
`;

export const Footer = styled.View``;