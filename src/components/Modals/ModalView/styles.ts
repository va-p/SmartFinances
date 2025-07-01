import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

type ColorProps = {
  color: string;
};

export const Overlay = styled.View`
  width: ${Dimensions.get('window').width}px;
  height: ${Dimensions.get('window').height}px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const Header = styled.View<ColorProps>`
  width: 100%;
  flex-direction: row;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  background-color: ${({ color }) => color};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
