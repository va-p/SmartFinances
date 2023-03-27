import React from 'react';
import { Tag, Name } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { TagProps } from '@components/TagListItem';

type Props = RectButtonProps & {
  data: TagProps;
  isChecked: boolean;
  color: string;
};

export function TagListItemRegisterTransaction({
  data,
  isChecked,
  color,
  ...rest
}: Props) {
  return (
    <Tag isChecked={isChecked} color={color} {...rest}>
      <Name isChecked={isChecked}>{data.name}</Name>
    </Tag>
  );
}
