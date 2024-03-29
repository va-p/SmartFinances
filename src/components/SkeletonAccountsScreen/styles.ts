import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '24px 16px 0' : '16px'};
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
`;

export const Title = styled.View`
  width: 100px;
  height: ${RFPercentage(4)}px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Chart = styled.View`
  width: 100%;
  height: ${RFPercentage(20)}px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const AccountsContainer = styled.View``;

export const MainContent = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const Account = styled.View`
  width: 100%;
  height: 60px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
`;

export const ButtonGroup = styled.View`
  width: 49%;
`;

export const AddAccountButton = styled.View`
  width: 100%;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;
