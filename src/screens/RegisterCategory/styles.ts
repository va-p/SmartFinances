import { TouchableOpacity } from 'react-native';
import styled, { css } from 'styled-components/native';

import { getBottomSpace } from 'react-native-iphone-x-helper';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

type TypeProps = 'primary' | 'secondary';

type Props = {
  color?: string;
  icon?: string;
  type?: TypeProps;
  isActive?: boolean;
}

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin-bottom: 12px;
`;

export const IconAndColor = styled.TouchableOpacity <Props>`
  width: 70px;
  height: 70px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${({ color }) => color};
  border-radius: 35px;
`;

export const Title = styled.Text`
  text-align: left;
  padding-left: 12px;
  font-size: ${RFValue(12)}px;
  ${({ theme }) => css`
    font-family: ${theme.fonts.medium};
    color: ${theme.colors.title};
  `};
`;

export const ColorsList = styled.View``;

export const ColorContainer = styled.View <Props>`
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
`;

export const Color = styled(TouchableOpacity) <Props>`
  width: 40px;
  height: 40px;
  background-color: ${({ color }) => color};
  border-width: 2px;
  border-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.background
  };
  border-radius: 20px;
`;

export const IconsList = styled.View``;

export const IconContainer = styled.TouchableOpacity <Props>`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  margin-bottom: 12px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.text : theme.colors.shape
  };
  border-radius: 30px;
`;

export const Icon = styled(Ionicons) <Props>`
  font-size: ${RFValue(30)}px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.background : theme.colors.text
  };
`;

export const Footer = styled.View`
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 0 12px 12px 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;