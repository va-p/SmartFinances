import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import { Item, Name } from './styles';

import { useTheme } from 'styled-components';

import CheckCircle from 'phosphor-react-native/src/icons/CheckCircle';

import { ThemeProps } from '@interfaces/theme';

type ListItemProps = {
  id: string;
  name: string;
};

type Props = RectButtonProps & {
  data: ListItemProps;
  isActive: boolean;
};

export function ListItem({ data, isActive, ...rest }: Props) {
  const theme: ThemeProps = useTheme();

  return (
    <Item {...rest}>
      <Name isActive={isActive}>{data.name}</Name>
      {isActive ? (
        <CheckCircle size={20} weight='fill' color={theme.colors.primary} />
      ) : (
        ''
      )}
    </Item>
  );
}
