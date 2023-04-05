import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  justify-content: space-between;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})``;

export const TermsAndPolicyContainer = styled.View`
  align-items: center;
  margin-top: 24px;
`;

export const CheckboxGroup = styled.View``;

export const TermsAndPolicy = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.text_light};
`;

export const Link = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.title};
`;

export const Footer = styled.View``;
