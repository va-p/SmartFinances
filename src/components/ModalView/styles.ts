import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

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
  align-items: center;
  justify-content: center;
  padding-right: 16px;
  padding-left: 16px;
  background-color: ${({ color }) => color};
`;

export const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
