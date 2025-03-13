import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  column-gap: 32px;
  padding: 4px 16px 4px 0;
`;

export const Button = styled(BorderlessButton)`
  color: ${({ theme }) => theme.colors.primary};
`;

export const ButtonShape = styled.View`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const TitleContainer = styled.View``;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditButton = styled(BorderlessButton)`
  position: absolute;
  top: 6px;
  right: 0px;
`;
