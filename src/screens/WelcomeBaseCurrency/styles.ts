import styled from 'styled-components/native';

type TitleProps = {
  primary?: boolean;
};

export const Container = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  row-gap: 32px;
  padding-horizontal: 24px;
`;

export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 24px;
  text-align: center;
  color: ${({ theme, primary = false }) =>
    primary ? theme.colors.primary : theme.colors.text};
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export const SelectButtonContainer = styled.View`
  width: 90%;
`;

export const ButtonContainer = styled.View`
  width: 50%;
`;
