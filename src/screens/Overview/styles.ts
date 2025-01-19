import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    marginBottom: RFValue(16),
  },
  // contentInsetAdjustmentBehavior: 'automatic',
})`
  flex: 1;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const CashFlowSection = styled.View``;

export const ChartContainer = styled.View`
  /* padding: 0 8px; */
`;

export const CategoriesSection = styled.View``;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.title};
`;

export const CategoriesContainer = styled.View`
  align-items: center;
`;
