import { RFValue } from 'react-native-responsive-fontsize';
import styled, { css } from 'styled-components/native';

type Props = {
  isTitle: boolean;
};

export const Container = styled.View`
  flex: 1;
  padding: 16px;
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

export const PluggyConnectContainer = styled.View`
  flex: 1;
  padding-bottom: 56px;
`;

export const Footer = styled.View`
  width: 100%;
  position: absolute;
  bottom: 56px;
  left: 16px;
  padding: 16px 0;
  align-items: center;
`;
