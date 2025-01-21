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
  border-top-left-radius: 75px;
  border-top-right-radius: 75px;
  /* padding: 8px 8px 8px; */
  background-color: ${({ theme }) => theme.colors.background_25};
`;
