import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export const Tag = styled(RectButton)`
  flex: 1;
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;