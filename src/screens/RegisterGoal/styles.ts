import styled from 'styled-components/native';

import { ThemeProps } from '@interfaces/theme';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const AmountContainer = styled.View`
  flex-direction: row;
`;

export const AmountGroup = styled.View`
  width: 60%;
`;

export const CurrencyGroup = styled.View`
  width: 40%;
`;

export const CurrencyStatic = styled.View`
  width: 90%;
  min-height: 40px;
  max-height: 40px;
  margin-top: 10px;
  justify-content: center;
  padding-left: 12px;
  background-color: ${({ theme }) => (theme as ThemeProps).colors.shape};
  border-radius: 10px;
`;

export const CurrencyStaticText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => (theme as ThemeProps).colors.text};
`;

export const ClearDeadlineButton = styled.TouchableOpacity`
  align-self: flex-end;
  padding: 8px 16px;
`;

export const ClearDeadlineText = styled.Text`
  font-family: ${({ theme }) => (theme as ThemeProps).fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => (theme as ThemeProps).colors.primary};
`;

export const Footer = styled.View`
  padding: 16px;
`;
