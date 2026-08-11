import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const ContentScroll = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingBottom: 56,
  },
  showsVerticalScrollIndicator: false,
})``;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${({ theme }) => theme.fonts.sizeTitleXl};
  padding-top: 16px;
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.title};
`;
