import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { BorderlessButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  width: 100%;
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BackButton = styled(BorderlessButton)`
  position: absolute;
  top: 12px;
  left: 0px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const TitleContainer = styled.View`
  align-items: center;
`;

export const Title = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const Description = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditButton = styled(BorderlessButton)`
  position: absolute;
  top: 12px;
  right: 0px;
`;
