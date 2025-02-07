import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export type TypeProps = 'primary' | 'secondary';

export const Container = styled(RectButton)`
  min-height: 40px;
  max-height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.button};
  border-radius: 20px;
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  margin: 0 8px;
  color: ${({ theme }) => theme.colors.textLight};
`;
