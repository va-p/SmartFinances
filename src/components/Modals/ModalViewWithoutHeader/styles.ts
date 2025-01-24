import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

export const Overlay = styled.View`
  width: ${Dimensions.get('window').width}px;
  height: ${Dimensions.get('window').height}px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

export const Container = styled.View`
  flex: 1;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;
