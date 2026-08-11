import styled from 'styled-components/native';

type ColorProps = {
  color: string;
};

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const MainContent = styled.View`
  flex: 1;
`;

export const Header = styled.View<ColorProps>`
  align-items: center;
  padding: 16px;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  background-color: ${({ color }) => color};
`;

export const TitleContainer = styled.View`
  width: 100%;
  min-height: '10%';
  max-height: '10%';
  flex-direction: row;
  justify-content: center;
`;

export const Title = styled.Text.attrs({
  numberOfLines: 3,
})`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

export const InputTransactionValuesContainer = styled.View`
  flex: 1;
`;

export const InputTransactionValueGroup = styled.View`
  min-width: 100%;
  max-width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const ContentScroll = styled.ScrollView.attrs({
  shownsVerticalScrollIndicator: false,
  contentContainerStyle: { marginBottom: 64 },
})``;

export const TransactionImageContainer = styled.Pressable`
  padding: 0 16px 16px;
`;

export const TransactionImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 10px;
`;

export const TransactionsTypes = styled.View`
  padding: 0 16px;
`;

export const Footer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px 16px;
`;

// ── Date Quick-Select Pills ───────────────────────────

export const DateSelectorContainer = styled.View`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  padding: 0 16px;
`;

export const DateSelectorLeft = styled.Pressable`
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
`;

export const DateSelectorLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const DatePillsLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding-left: 8px;
`;

type PillProps = {
  active: boolean;
  accentColor: string;
};

export const DatePill = styled.TouchableOpacity<PillProps>`
  align-items: center;
  justify-content: center;
  padding: 3px 7px;
  border-radius: 10px;
  background-color: ${({ active, accentColor, theme }) =>
    active ? accentColor : theme.colors.overlayGray};
`;

export const DatePillText = styled.Text<PillProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ active, accentColor, theme }) =>
    active ? theme.colors.text : theme.colors.textPlaceholder};
`;
