import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export const Tag = styled(RectButton)`
  height: 24px;
  justify-content: center;
  padding: 4px 6px;
  margin-right: 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.overlayGray};
`;

export const Name = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.text};
`;
