import styled from 'styled-components/native';

import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const QuickAddContainer = styled.View`
  padding-top: 4px;
`;

export const QuickAddButton = styled(RectButton)`
  min-height: 48px;
  max-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border-width: 1px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.primary};
`;

export const QuickAddButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  ${({ theme }) => theme.fonts.sizeTitle};
  padding-left: 8px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const QuickAddInputRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const QuickAddInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text,
}))`
  flex: 1;
  min-height: 48px;
  max-height: 48px;
  padding: 0 16px;
  margin-right: 8px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${({ theme }) => theme.fonts.sizeTitle};
  color: ${({ theme }) => theme.colors.title};
`;

export const QuickAddIconButton = styled(RectButton)`
  min-width: 48px;
  max-width: 48px;
  min-height: 48px;
  max-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-left: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
`;

export const QuickAddConfirmButton = styled(RectButton)`
  min-width: 48px;
  max-width: 48px;
  min-height: 48px;
  max-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
