import styled from 'styled-components/native';

type Props = {
  is_amount_reached: boolean;
};

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 8px;
`;

export const Percentage = styled.View<Props>`
  max-width: 100%;
  min-height: 24px;
  max-height: 24px;
  justify-content: center;
  background-color: ${({ theme, is_amount_reached }) =>
    is_amount_reached ? theme.colors.attention : theme.colors.success};
  border-radius: 8px;
`;

export const Percent = styled.Text`
  padding-left: 8px;
`;
