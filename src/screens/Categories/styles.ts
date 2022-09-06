import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const CategoriesContainer = styled.View`
  height: ${RFPercentage(82)}px;
`;

export const Footer = styled.View`
  padding: 0 20px;
`;