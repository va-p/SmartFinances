import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  padding: 0 16px;
`;

type OptionLabelProps = {
  isSelected: boolean;
};

export const OptionRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  max-height: 52px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.shape};
`;

export const OptionLabel = styled.Text<OptionLabelProps>`
  font-family: ${({ theme, isSelected }) =>
    isSelected ? theme.fonts.bold : theme.fonts.regular};
  font-size: ${RFValue(15)}px;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : theme.colors.text};
`;

export const CheckmarkContainer = styled.View`
  margin-left: 12px;
`;
