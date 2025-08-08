import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  border-top-right-radius: ${({ theme }) => theme.borders.borderRadiusShape};
  border-top-left-radius: ${({ theme }) => theme.borders.borderRadiusShape};
`;
