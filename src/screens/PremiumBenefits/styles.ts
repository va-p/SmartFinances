import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 16px;
  text-align: center;
  margin-top: 32px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  text-align: center;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.colors.text};
`;

export const PremiumBenefitsContainer = styled.View`
  margin-bottom: 16px;
`;

export const PackagesContainer = styled.View``;

export const AdvicesContainer = styled.View``;

export const Advice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  text-align: center;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
