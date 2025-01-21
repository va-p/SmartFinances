import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient).attrs({
  colors: ['#E6E9F4', '#FFEBCE'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})``;
