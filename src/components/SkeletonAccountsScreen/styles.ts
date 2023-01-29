import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.View`
  width: 100px;
  height: ${RFPercentage(4)}px;
  margin-bottom: 5px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Filters = styled.View`
  width: 100px;
  height: ${RFPercentage(3.5)}px;
  margin-bottom: 15px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Chart = styled.View`
  width: 100%;
  height: ${RFPercentage(20)}px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Account = styled.View`
  width: 100%;
  height: 60px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Footer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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