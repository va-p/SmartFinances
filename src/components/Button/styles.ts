import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
};

export const Container = styled(RectButton)<ContainerProps>`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin-top: 12px;
  background-color: ${({ theme, type }) =>
    type === 'primary' ? theme.colors.shape : theme.colors.primary};
  border-radius: 10px;
`;

export const Text = styled.Text<ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  margin: 0 8px;
  color: ${({ theme, type }) =>
    type === 'primary' ? theme.colors.title : theme.colors.text_light};
`;

export const Load = styled.ActivityIndicator.attrs<ContainerProps>(
  ({ type, theme }) => ({
    color: type === 'primary' ? theme.colors.primary : theme.colors.shape,
  })
)``;
