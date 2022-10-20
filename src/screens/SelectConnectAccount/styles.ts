import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;