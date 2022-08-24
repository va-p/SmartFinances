import styled from 'styled-components/native';

import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

type ColorProps = {
  color: string
}

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View <ColorProps>`
  min-height: ${RFPercentage(18)}px;
  max-height: ${RFPercentage(18)}px;
  align-items: center;
  padding: 10px 20px;
  margin-bottom: 3px;
  background-color: ${({ color }) => color};
`;

export const HeaderRow = styled.View`
  width: 100%;  
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
`;

export const CategorySelectButtonContainer = styled.View`
  width: 55%;
  flex-direction: row;
`;

export const InputTransactionValueContainer = styled.View`
  width: 45%;
  flex-direction: row;
  align-items: center;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const TransactionsTypes = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const GroupButtonDateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const GroupButtonDate = styled.View`
  width: 48%;
`;

export const Footer = styled.View`
  width: 100%;
  padding: 20px;
`;