import styled from 'styled-components/native';
import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  flex: 1;
`;

export const ScrollContent = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    backgroundColor: 'transparent',
    paddingBottom: 54,
  },
})``;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

export const FilterButtonGroup = styled.View`
  width: 24%;
`;

export const CashFlowSection = styled.View`
  padding: 16px 16px 0;
`;

export const CategoriesSection = styled.View`
  padding: 0 16px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeTitleXl};
  margin-bottom: 8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const CategoriesContainer = styled.View`
  align-items: center;
`;

export const ChartContainer = styled.View`
  margin-bottom: 16px;
`;
