import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Body = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
`;

export const Footer = styled.View`
  justify-content: flex-end;
  padding: 12px;
`;