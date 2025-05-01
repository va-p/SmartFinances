import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  align-items: center;
  margin-bottom: 8px;
`;

export const CashFlowContainer = styled.View``;

export const CashFlowTotal = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(18)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.title};
`;

export const CashFlowDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  margin-top: -8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SearchButton = styled(BorderlessButton)`
  position: absolute;
  top: 4px;
  right: 48px;
`;

export const HideDataButton = styled(BorderlessButton)`
  position: absolute;
  top: 4px;
  right: 16px;
`;

export const FiltersContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

export const FilterButtonGroup = styled.View`
  width: ${RFPercentage(12)}px;
`;

export const SearchInputContainer = styled.View`
  flex-direction: row;
  min-height: 40px;
  max-height: 40px;
  align-items: center;
  margin: 8px 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.borders.borderRadiusButtonAndInput};
`;

export const ClearSearchButton = styled(BorderlessButton)`
  position: absolute;
  right: 8px;
`;

export const Transactions = styled.View`
  flex: 1;
  padding: 0 16px;
`;
