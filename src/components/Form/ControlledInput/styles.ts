import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

import { TypeProps } from '../Input/styles';

type Props = {
  type: TypeProps;
};

export const Container = styled.View`
  width: 100%;
`;

export const ErrorMessage = styled.Text<Props>`
  font-size: ${RFValue(12)}px;
  color: ${({ theme, type }) =>
    type === 'primary' ? theme.colors.attention : theme.colors.shape};
`;
