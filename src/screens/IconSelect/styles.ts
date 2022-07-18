import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type IconProps = {
  icon: string;
  isActive: boolean;
}

export const Container = styled.View`
  flex: 1;
`;

export const IconContainer = styled.TouchableOpacity <IconProps>`
  width: 45px;
  height: 45px;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  margin-bottom: 8px;
  border: 5px solid ${({ theme, isActive }) =>
    isActive ? theme.colors.secondary : theme.colors.background
  };
  border-radius: 25px;
`;

export const Icon = styled(Ionicons) <IconProps>`
  font-size: ${RFValue(30)}px;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 24px;
`;