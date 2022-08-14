import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View`
  flex: 1;
  width: 100%;
  justify-content: space-between;
  padding: 10px 20px;
`;

export const Fields = styled.View``;

export const TransactionsTypes = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const GroupButtonDateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const GroupButtonDate = styled.View`
  width: 48%;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 20px;
`;