import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const Line = styled.View`
  width: 100%;
  height: 1px;
  margin: 10px 0;
  background-color: ${({ theme }) => theme.colors.primary};
`;