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
  font-size: ${RFValue(10)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditButton = styled(BorderlessButton)`
  position: absolute;
  right: 0px;
`;
