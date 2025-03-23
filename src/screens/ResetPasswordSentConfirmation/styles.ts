import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
`;

export const SectionHeader = styled.View`
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
`;

export const MainContent = styled.View`
  flex: 1;
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  align-items: center;
  justify-content: center;
  row-gap: 8px;
  padding: 64px 8px 8px;
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;
