import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

// D5: sits between the progress HeaderCard and "Contas vinculadas"; the
// HeaderCard already carries margin-bottom: 16px.
export const ChartContainer = styled.View`
  margin-bottom: 16px;
`;

export const LegendContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 6px;
`;

export const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
  margin-top: 4px;
`;

export const LegendSquare = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;

export const LegendDash = styled.View`
  width: 5px;
  height: 2px;
  border-top-width: 2px;
  border-style: dashed;
  border-color: ${({ theme }) => (theme as ThemeProps).colors.textPlaceholder};
`;

export const LegendText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: ${({ theme }) => (theme as ThemeProps).fonts.sizeText};
  color: ${({ theme }) => (theme as ThemeProps).colors.textPlaceholder};
`;
