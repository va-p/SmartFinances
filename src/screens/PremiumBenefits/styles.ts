import styled from 'styled-components/native';

import { Check } from 'phosphor-react-native';
import theme from '@themes/theme';

export const Container = styled.View`
  flex: 1;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ImgContainer = styled.View``;

export const Img = styled.Image`
  width: 100%;
  height: 100%;
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

export const PremiumBenefit = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const PremiumBenefitIcon = styled(Check).attrs({
  size: 16,
  color: theme.colors.success,
})`
  margin-right: 8px;
`;

export const PremiumBenefitDescription = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Advice = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  text-align: center;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
