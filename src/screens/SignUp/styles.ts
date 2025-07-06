import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  padding-top: 16px;
`;

export const MainContent = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
  },
})`
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
`;
