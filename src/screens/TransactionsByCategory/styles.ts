import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 16px 16px 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const FiltersContainer = styled.View`
  width: 24%;
  flex-direction: row;
  align-self: center;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;
