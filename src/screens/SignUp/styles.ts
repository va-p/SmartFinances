import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView``;

export const MainContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
  },
})`
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusSreenSectionContent};
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
`;
