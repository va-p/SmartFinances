import { Platform } from 'react-native';
import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

import { ThemeProps } from '@interfaces/theme';

type HistoryAmountProps = { type: string };

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '0 16px 20px' : '0 16px'};
  background-color: ${({ theme }) => (theme as ThemeProps).colors.background};
`;

export const HeaderCard = styled.View`
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  align-items: center;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 25px;
`;

export const GoalCurrent = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  font-size: 28px;
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const GoalTargetDescription = styled.Text`
  margin-bottom: 12px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const PercentBarContainer = styled.View`
  width: 100%;
`;

export const GoalDeadline = styled.Text`
  margin-top: 4px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const ReachedBadge = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.success};
`;

export const ReachedBadgeText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.shape};
`;

export const ReadOnlyNote = styled.Text`
  margin-bottom: 16px;
  text-align: center;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const SectionTitle = styled.Text`
  margin-bottom: 8px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const LinkedAccountRow = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 25px;
`;

export const LinkedAccountName = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const LinkedAccountBalance = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.medium};
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const HistoryItemContainer = styled.View`
  width: 100%;
  padding: 8px 16px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 25px;
`;

export const HistoryRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const HistoryDescription = styled.Text`
  flex: 1;
  margin-right: 8px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.title};
`;

export const HistoryAmount = styled.Text<HistoryAmountProps>`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.bold};
  color: ${({ theme, type }) =>
    type === 'TRANSFER_CREDIT'
      ? (theme as ThemeProps).colors.success
      : (theme as ThemeProps).colors.attention};
`;

export const HistoryDate = styled.Text`
  margin-top: 4px;
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const ActionsContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 32px;
`;

export const ActionButtonTouchable = styled(RectButton)`
  min-width: 64px;
  max-width: 64px;
  align-items: center;
`;

export const ActionButtonIconContainer = styled.View`
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.primary_light};
  border-radius: 32px;
`;

export const ActionButtonText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;


export const Footer = styled.View`
  flex-direction: row;
  padding: 8px 0 16px;
`;

export const FooterButtonGroup = styled.View`
  flex: 1;
  margin-horizontal: 4px;
`;

export const DeletePickerFooter = styled.View`
  padding: 16px;
`;
