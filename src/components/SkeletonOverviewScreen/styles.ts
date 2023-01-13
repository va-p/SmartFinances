import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  width: 100%;
  align-items: center;
`;

export const Title = styled.View`
  width: 100px;
  height: ${RFPercentage(3.5)}px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Filters = styled.View`
  width: 200px;
  height: ${RFPercentage(3.5)}px;
  margin-bottom: ${RFPercentage(8)}px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Chart = styled.View`
  width: 250px;
  height: 250px;
  margin-bottom: ${RFPercentage(4)}px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 125px;
`;

export const Category = styled.View`
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;