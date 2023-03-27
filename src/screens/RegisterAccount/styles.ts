import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  padding: 0 16px;
`;

export const Footer = styled.View`
  padding: 16px;
`;
