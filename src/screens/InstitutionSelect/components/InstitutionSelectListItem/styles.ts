import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

type ContainerProps = {
  isChecked: boolean;
};

export const Container = styled(RectButton)<ContainerProps>`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 10px;
  background-color: ${({ theme, isChecked }) =>
    isChecked ? theme.colors.primary : theme.colors.shape};
`;

export const Name = styled.Text<ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, isChecked }) =>
    isChecked ? theme.colors.textLight : theme.colors.title};
`;
