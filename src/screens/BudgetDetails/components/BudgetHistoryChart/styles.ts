import styled from 'styled-components/native';

export const ChartContainer = styled.View`
  margin-top: 16px;
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
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const LegendDash = styled.View`
  width: 5px;
  height: 2px;
  border-top-width: 2px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.textPlaceholder};
`;

export const LegendText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.textPlaceholder};
`;
