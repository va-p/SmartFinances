import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

import {
  ExecutionStatusTypes,
  StatusTypes,
} from '@interfaces/bankingIntegration';

type Props = {
  isTitle: boolean;
};

type StatusProps = {
  status: StatusTypes;
  executionStatus: ExecutionStatusTypes;
};

export const Container = styled(RectButton)`
  flex-direction: row;
  min-height: 72px;
  max-height: 104px;
  padding: 16px;
  margin-bottom: 8px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${({ theme }) => theme.borders.borderRadiusShape};
`;

export const MainContent = styled.View`
  min-width: 90%;
  max-width: 90%;
`;

export const AccountNameContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const AccountName = styled.Text<Props>`
  font-size: ${RFValue(12)}px;

  ${({ isTitle }) =>
    isTitle &&
    css`
      font-family: ${({ theme }) => theme.fonts.medium};
      color: ${({ theme }) => theme.colors.title};
    `};
  ${({ isTitle }) =>
    !isTitle &&
    css`
      font-family: ${({ theme }) => theme.fonts.regular};
      color: ${({ theme }) => theme.colors.text};
    `};
`;

export const LastSyncDate = styled.Text<Props>`
  font-size: ${RFValue(12)}px;

  ${({ isTitle }) =>
    isTitle &&
    css`
      font-family: ${({ theme }) => theme.fonts.medium};
      color: ${({ theme }) => theme.colors.title};
    `};
  ${({ isTitle }) =>
    !isTitle &&
    css`
      font-family: ${({ theme }) => theme.fonts.regular};
      color: ${({ theme }) => theme.colors.text};
    `};
`;

export const StatusContainer = styled.View`
  min-width: 90%;
  max-width: 90%;
  padding-left: 16px;
`;

export const ConnectionStatus = styled.View<StatusProps>`
  min-width: 12px;
  max-width: 12px;
  min-height: 12px;
  max-height: 12px;
  border-radius: 6px;

  ${({ status, executionStatus }) =>
    status === 'UPDATED' &&
    executionStatus === 'SUCCESS' &&
    css`
      background-color: ${({ theme }) => theme.colors.success};
      border: 1px solid ${({ theme }) => theme.colors.success};
    `};
  ${({ executionStatus }) =>
    executionStatus === 'ERROR' &&
    css`
      background-color: ${({ theme }) => theme.colors.attention};
      border: 1px solid ${({ theme }) => theme.colors.attention};
    `};

  ${({ status, executionStatus }) =>
    status === 'OUTDATED' &&
    executionStatus !== 'SUCCESS' &&
    executionStatus !== 'ERROR' &&
    css`
      background-color: ${({ theme }) => theme.colors.primary};
      border: 1px solid ${({ theme }) => theme.colors.primary};
    `};
`;
