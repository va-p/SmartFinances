import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

type TitleProps = {
  primary?: boolean;
};

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  align-items: center;
  justify-content: center;
  row-gap: 32px;
`;

export const LogoWrapper = styled.View`
  width: 100%;
  height: 20%;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.Image.attrs({
  resizeMode: 'contain',
})``;

export const Title = styled.Text<TitleProps>`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(24)}px;
  text-align: left;
  margin-bottom: 32px;
  color: ${({ theme, primary = false }) =>
    primary ? theme.colors.primary : theme.colors.text};
`;

export const Text = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
`;
