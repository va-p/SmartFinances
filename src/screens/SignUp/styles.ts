import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const MainContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
  },
})`
  flex: 1;
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
  /* padding: 8px 8px 8px; */
  background-color: ${({ theme }) => theme.colors.background25};
`;
