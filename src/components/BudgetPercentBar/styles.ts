import styled from 'styled-components/native';

export const Container = styled.View`
  margin-bottom: 4px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 8px;
`;

export const Percent = styled.Text`
  padding-left: 8px;
`;
