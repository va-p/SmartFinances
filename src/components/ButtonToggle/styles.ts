import styled from 'styled-components/native';

export const Container = styled.View`
  min-height: 56px;
  max-height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubTitle};
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleContainer = styled.View`
  flex-direction: row;
`;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeSubTitle};
  padding-right: 10px;
  color: ${({ theme }) => theme.colors.text};
`;
