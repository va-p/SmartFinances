import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  padding: 16px 16px 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const MonthSelect = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px 16px;
`;

export const MonthSelectButton = styled(BorderlessButton)``;

export const Month = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.text};
`;
