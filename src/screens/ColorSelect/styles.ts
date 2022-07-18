import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';

type ColorProps = {
  color: string;
  isActive: boolean;
}

export const Container = styled.View`
  flex: 1;
`;

export const ColorContainer = styled.View <ColorProps>`
  width: 50px;
  height: 50px;
  border: 5px solid ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary : theme.colors.background
  };
  border-radius: 25px;
`;

export const Color = styled(BorderlessButton) <ColorProps>`
  width: 40px;
  height: 40px;
  margin-right: 8px;
  margin-bottom: 8px;
  background-color: ${({ color }) => color};
  border-radius: 20px;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 24px;
`;