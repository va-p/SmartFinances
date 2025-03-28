import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import { Item, Name } from './styles';

import CheckCircle from 'phosphor-react-native/src/icons/CheckCircle';

import theme from '@themes/theme';

type ListItemProps = {
  id: string;
  name: string;
};

type Props = RectButtonProps & {
  data: ListItemProps;
  isActive: boolean;
};

export function ListItem({ data, isActive, ...rest }: Props) {
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
