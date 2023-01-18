import styled from 'styled-components/native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const Overlay = styled(GestureHandlerRootView)`
  flex: 1;
  padding-top: 80px;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const Container = styled.View`
  flex: 1;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  background-color: ${({ theme }) => theme.colors.background};
`;