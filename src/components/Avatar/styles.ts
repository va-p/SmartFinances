import styled from 'styled-components/native';

import { LinearGradient } from 'expo-linear-gradient';

export const Container = styled(LinearGradient)`
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
`;

export const AvatarImage = styled.Image`
  width: 78px;
  height: 78px;
  border-radius: 40px;
`;