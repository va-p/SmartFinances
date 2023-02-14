import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

type ContainerProps = {
  isActive: boolean,
  color?: string
}

export const Tag = styled(RectButton) <ContainerProps>`
  height: 32px;
  justify-content: center;
  padding: 5px;
  margin-right: 10px;
  border-radius: 16px;
  background-color: ${({ theme, isActive, color }) => isActive ? color : theme.colors.shape};
`;

export const Name = styled.Text<ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, isActive }) => isActive ? theme.colors.text_light : theme.colors.text};
`;