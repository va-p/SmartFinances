import styled from 'styled-components/native';

export const ContentScroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
})``;

export const IconsRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-vertical: 16px;
`;

export const OverlappingIcon = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.background};
  align-items: center;
  justify-content: center;
  margin-left: -10px;
`;

export const OverlappingIconFirst = styled(OverlappingIcon)`
  margin-left: 0;
`;

export const Explanation = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.title};
  text-align: center;
  margin-bottom: 8px;
`;

export const ExamplesTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 16px;
`;

export const CategoryRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

export const CategoryIconCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primary_dark};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

export const CategoryTextContainer = styled.View`
  flex: 1;
`;

export const CategoryTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const CategoryExamples = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Footer = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 16px;
`;
