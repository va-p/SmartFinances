import React from 'react';
import {
  Tag,
  Name
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

export interface TagProps {
  id: string;
  name: string;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: TagProps;
}

export function TagListItem({ data, ...rest }: Props) {
  return (
    <Tag {...rest}>
      <Name>{data.name}</Name>
    </Tag>
  );
}