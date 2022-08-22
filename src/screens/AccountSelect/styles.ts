import styled from 'styled-components/native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const Container = styled(GestureHandlerRootView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;