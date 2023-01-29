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
  margin-bottom: ${RFPercentage(5)}px;
`;

export const Title = styled.View`
  width: 100px;
  height: ${RFPercentage(5)}px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: ${RFPercentage(2)}px;
`;

export const Body = styled.View`
  height: ${RFPercentage(70)}px;
`;


export const Tag = styled.View`
  width: 100%;
  height: 56px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Footer = styled.View`
  flex: 1;
  min-height: ${RFPercentage(25)}px;
  max-height: ${RFPercentage(25)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const AddTagButton = styled.View`
  width: 100%;
  height: 56px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;