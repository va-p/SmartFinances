import styled from 'styled-components/native';

export const Container = styled.ScrollView`
  flex: 1;
  background: white;
`;

export const Content = styled.View`
  margin-top: 20px;
`;

export const Label = styled.Text<{ disabled: boolean }>`
  font-size: 16px;
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textPlaceholder : theme.colors.text};
  margin-left: 5px;
`;

export const Value = styled.View<{ disabled: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-width: 1px;
  padding: 10px;
  border-radius: 15px;
  margin: 5px;
  border-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabledGray : theme.colors.skyBlue};
`;
