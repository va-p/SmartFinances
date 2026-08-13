import styled from 'styled-components/native';

export const Container = styled.View`
  min-height: 56px;
  max-height: 64px;
  flex-direction: row;
  padding: 16px;
  column-gap: 8px;
`;

export const IconContainer = styled.View`
  max-width: 10%;
`;

export const Content = styled.View`
  min-width: 96%;
  max-width: 96%;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-right: 16px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubtitle};
  color: ${({ theme }) => theme.colors.text};
`;

export const SubTitle = styled.Text.attrs({
  numberOfLines: 2,
})`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeText};
  color: ${({ theme }) => theme.colors.text};
`;
