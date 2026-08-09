import styled from 'styled-components/native';
import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

export const Label = styled.Text<{ secondary?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme, secondary }) =>
    secondary ? theme.colors.text_secondary || theme.colors.text : theme.colors.text};
  margin-bottom: ${({ secondary }) => (secondary ? 8 : 12)}px;
  margin-top: ${({ secondary }) => (secondary ? 16 : 0)}px;
`;

export const QuantityRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 8px;
`;

export const QuantityButton = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const QuantityButtonText = styled.View`
  align-items: center;
  justify-content: center;
`;

export const QuantityInput = styled.TextInput`
  width: 80px;
  height: 48px;
  border-radius: 12px;
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(16)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export const PeriodSelector = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.shape};
  margin-bottom: 8px;
`;

export const PeriodText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 10px;
`;

export const Footer = styled.View`
  margin-top: auto;
  padding-top: 24px;
`;
