import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
}

export const Container = styled.View <ContainerProps>`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BackButton = styled(BorderlessButton)`
  position: absolute;
  left: 0px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Icon = styled(Ionicons)`
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.title};
`;