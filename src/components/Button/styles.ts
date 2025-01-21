import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
};

export const Container = styled(RectButton)<ContainerProps>`
  min-height: 40px;
  max-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.button};
  border-radius: 20px;
`;

export const Text = styled.Text<ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  margin: 0 8px;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const Load = styled.ActivityIndicator.attrs<ContainerProps>(
  ({ type, theme }) => ({
    color: type === 'primary' ? theme.colors.primary : theme.colors.shape,
  })
)``;
