import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px 16px 0;
`;

export const PluggyConnectContainer = styled.View`
  flex: 1;
  padding-bottom: 56px;
`;

export const ConnectedAccountsList = styled.FlatList``;
