import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const MonthSelectButton = styled(BorderlessButton)``;

export const PeriodRulerList = styled.FlatList.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})``;
