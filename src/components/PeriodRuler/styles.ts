import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

type ContainerProps = {
  horizontalPadding?: string;
};
export const Container = styled.View<ContainerProps>`
  flex-direction: row;
  align-items: center;
  padding: ${({ horizontalPadding }) => `0 ${horizontalPadding}px`};
  // padding-right: ${({ horizontalPadding }) => horizontalPadding}px;
  // padding-left: ${({ horizontalPadding }) => horizontalPadding}px;
`;

export const MonthSelectButton = styled(BorderlessButton)``;

export const PeriodRulerList = styled.FlatList.attrs({
  inverted: true,
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { alignItems: 'center' },
})``;
