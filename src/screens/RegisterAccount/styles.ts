import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  padding: 0 16px;
  color: ${({ theme }) => theme.colors.attention};
`;

export const Form = styled.View`
  padding: 0 16px;
`;

export const Footer = styled.View`
  padding: 16px;
`;
