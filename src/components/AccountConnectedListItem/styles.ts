import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

type Props = {
  isTitle: boolean;
};

export const Container = styled.View`
  flex: 1;
  min-height: 56px;
  /* max-height: 56px; */
  padding: 8px 0;
  margin-bottom: 16px;
`;

export const AccountNameAndEditBtContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const AccountName = styled.Text<Props>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, isTitle }) =>
    isTitle ? theme.colors.title : theme.colors.text};
`;

export const EditButton = styled(BorderlessButton)`
  /* position: absolute; */
  /* top: 12px; */
  /* right: 0px; */
`;

export const StatusContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const LastSyncDate = styled.Text<Props>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, isTitle }) =>
    isTitle ? theme.colors.title : theme.colors.text};
`;

export const ConnectionStatus = styled.View`
  min-width: 12px;
  max-width: 12px;
  min-height: 12px;
  max-height: 12px;
  background-color: ${({ theme }) => theme.colors.success};
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: 6px;
`;
