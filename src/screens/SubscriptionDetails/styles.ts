import styled from 'styled-components/native';

import { TouchableOpacity } from 'react-native';

export const Container = styled.View`
  flex: 1;
`;

export const ContentScroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
})``;

export const Row = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding-horizontal: 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const RowLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const RowIcon = styled.View`
  margin-right: 12px;
`;

export const RowLabel = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const RowLabelDanger = styled(RowLabel)`
  color: ${({ theme }) => theme.colors.attention};
`;

export const RowValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding-horizontal: 16px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const SectionHeaderTitle = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const EditButton = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding-horizontal: 8px;
  padding-vertical: 6px;
`;

export const EditButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const SectionBody = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 16px;
  margin-top: -4px;
  margin-bottom: 12px;
`;

export const DetailLine = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 8px;
`;

export const DetailLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

export const DetailValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.title};
`;

// ── Edit bottom sheet ──────────────────────────────────────────────────────

export const EditSheetContent = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 24px;
`;

export const InputLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
  margin-top: 12px;
`;

export const EditInput = styled.TextInput`
  min-height: 48px;
  padding-horizontal: 16px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const PeriodPills = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 4px;
`;

export const PeriodPill = styled(TouchableOpacity).attrs({
  activeOpacity: 0.7,
})<{ isActive: boolean }>`
  flex: 1;
  align-items: center;
  padding-vertical: 10px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary_light : theme.colors.shape};
`;

export const PeriodPillText = styled.Text<{ isActive: boolean }>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: 13px;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text};
`;

export const SaveButtonContainer = styled.View`
  margin-top: 24px;
`;
