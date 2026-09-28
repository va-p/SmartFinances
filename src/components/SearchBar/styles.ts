import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

export const SearchInputContainer = styled.View`
  flex-direction: row;
  min-height: 40px;
  max-height: 40px;
  align-items: center;
  margin: 8px 16px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: ${({ theme }) =>
    (theme as ThemeProps).borders.borderRadiusButtonAndInput};
`;

export const ClearSearchButton = styled(BorderlessButton)`
  position: absolute;
  right: 8px;
`;
