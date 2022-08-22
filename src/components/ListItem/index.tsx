import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import {
  Item,
  Name,
  Icon
} from './styles';

type ListItemProps = {
  id: string;
  name: string;
}

type Props = RectButtonProps & {
  data: ListItemProps;
  isActive: boolean;
}

export function ListItem({ data, isActive, ...rest }: Props) {
  return (
    <Item {...rest}>
      <Name isActive={isActive}>
        {data.name}
      </Name>
      <Icon name={isActive ? 'checkmark-circle' : ''} />
    </Item>
  );
}