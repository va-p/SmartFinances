import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { RFPercentage } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  padding: ${Platform.OS === 'ios' ? '24px 16px 0' : '16px 16px 0'};
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
  margin-bottom: 4px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Filters = styled.View`
  width: 100px;
  height: ${RFPercentage(3.5)}px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Chart = styled.View`
  width: 100%;
  height: 110px;
  background-color: ${({ theme }) => theme.colors.shape};
  margin-bottom: 40px;
  border-radius: 10px;
`;

export const Transaction = styled.View`
  width: 100%;
  height: 60px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;
