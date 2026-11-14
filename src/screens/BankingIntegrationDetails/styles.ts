import styled, { css } from 'styled-components/native';

type Props = {
  isTitle: boolean;
};

export const Container = styled.View`
  flex: 1;
  padding: 16px;
`;

export const AccountName = styled.Text<Props>`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};

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
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};

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

export const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme }) => theme.colors.title};
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const AccountRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.shape};
`;

export const AccountRowMain = styled.View`
  flex: 1;
  padding-right: 12px;
`;

export const AccountRowName = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme }) => theme.colors.title};
`;

export const AccountRowMeta = styled.Text`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text};
`;

export const AccountRowBalance = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  font-family: ${({ theme }) => theme.fonts.medium};
  color: ${({ theme }) => theme.colors.title};
`;

export const EmptyAccountsText = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  font-family: ${({ theme }) => theme.fonts.regular};
  color: ${({ theme }) => theme.colors.text};
`;

export const Footer = styled.View`
  width: 100%;
  position: absolute;
  bottom: 56px;
  left: 16px;
  padding: 16px 0;
  align-items: center;
`;
