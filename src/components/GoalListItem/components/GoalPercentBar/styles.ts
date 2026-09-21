import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.View`
  margin-bottom: 4px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 8px;
`;

export const Percent = styled.Text`
  position: absolute;
  top: 2px;
  padding-left: 8px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;
