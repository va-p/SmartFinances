import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
}

export const Container = styled(RectButton) <ContainerProps>`
  width: 100%;
  min-height: 56px;
  max-height: 56px;
  align-items: center;
  padding: 18px;
  margin-top: 10px;
  background-color: ${({ theme, type }) => type === 'primary' ? theme.colors.shape : theme.colors.primary};
  border-radius: 10px;
`;

export const Title = styled.Text <ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, type }) => type === 'primary' ? theme.colors.title : theme.colors.text_light};
`;

export const Load = styled.ActivityIndicator.attrs<ContainerProps>(({ type, theme }) => ({
  color: type === 'primary' ? theme.colors.primary : theme.colors.shape
}))``;