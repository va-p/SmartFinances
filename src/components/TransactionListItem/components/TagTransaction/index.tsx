import React from 'react';
import {
  Tag,
  Name
} from './styles';

import { TagProps } from '@components/TagListItem';

type Props = {
  data: TagProps;
}

export function TagTransaction({ data }: Props) {
  return (
    <Tag>
      <Name>{data.name}</Name>
    </Tag>
  );
}