import styled from 'styled-components/native';

import Check from 'phosphor-react-native/src/icons/Check';
import theme from '@themes/theme';

export const Container = styled.View`
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
