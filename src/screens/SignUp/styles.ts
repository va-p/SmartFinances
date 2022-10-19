import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  padding: 10px;
`;

export const Footer = styled.View`
  padding: 10px;
`;