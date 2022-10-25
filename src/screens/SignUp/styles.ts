import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Form = styled.View``;

export const TermsAndPolicyContainer = styled.View`
  margin-top: 20px;
  flex-direction: row;
`;

export const CheckboxGroup = styled.View``;

export const TermsAndPolicy = styled.Text`
  text-align: center;
  padding-left: 10px;
  color: ${({ theme }) => theme.colors.text_light};
`;

export const Link = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.title};
`;

export const Footer = styled.View``;