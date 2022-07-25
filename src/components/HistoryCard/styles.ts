import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native';

interface ContainerProps {
  color: string;
}

export const Container = styled.View<ContainerProps>`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;  
  padding: 13px 24px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-left-width: 5px;
  border-left-color: ${({ color }) => color};
  border-radius: 5px;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(15)}px;
`;

export const Amount = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: ${RFValue(15)}px;
`;