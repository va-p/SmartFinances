import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const SectionHeader = styled.View`
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
`;

export const MainContent = styled.View`
  flex: 1;
  border-top-left-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  border-top-right-radius: ${({ theme }) =>
    theme.borders.borderRadiusScreenSectionContent};
  align-items: center;
  row-gap: 8px;
  padding: 64px 8px 8px;
  background-color: ${({ theme }) => theme.colors.backgroundCardHeader};
`;

export const LogoWrapper = styled.View`
  width: 100%;
  height: 20%;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`;

export const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})``;

export const SubTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
`;

export const FormWrapper = styled.View`
  width: 70%;
  row-gap: 16px;
  margin-bottom: 8px;
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(12)}px;
  color: ${({ theme }) => theme.colors.text};
`;
