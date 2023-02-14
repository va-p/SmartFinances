import React from 'react';
import {
  Tag,
  Name
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { TagProps } from '@components/TagListItem';

type Props = RectButtonProps & {
  data: TagProps;
  isActive: boolean;
  color: string;
}

export function TagListItemRegisterTransaction({ data, isActive, color, ...rest }: Props) {
  return (
    <Tag isActive={isActive} color={color} {...rest}>
      <Name isActive={isActive}>{data.name}</Name>
    </Tag>
  );
}