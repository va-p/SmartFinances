import styled from 'styled-components/native';

import { BorderlessButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import { Platform } from 'react-native';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
};

export const Container = styled.View<ContainerProps>`
  width: 100%;
  height: 48px;
  flex-direction: row;
  align-items: ${Platform.OS === 'ios' ? 'flex-end' : 'center'};
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BackButton = styled(BorderlessButton)`
  position: absolute;
  left: 0px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.title};
`;
