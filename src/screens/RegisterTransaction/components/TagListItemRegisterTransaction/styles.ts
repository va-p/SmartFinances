import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

type ContainerProps = {
  isChecked: boolean;
  color?: string;
};

export const Tag = styled(RectButton)<ContainerProps>`
  height: 32px;
  justify-content: center;
  padding: 5px;
  margin-right: 10px;
  border-radius: 16px;
  background-color: ${({ theme, isChecked, color }) =>
    isChecked ? color : theme.colors.overlayGray};
`;

export const Name = styled.Text<ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme, isChecked }) =>
    isChecked ? theme.colors.textLight : theme.colors.text};
`;
