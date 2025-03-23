import React from 'react';
import { Tag, Name } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { FadeInUp } from 'react-native-reanimated';

export interface TagProps {
  id: string;
  name: string;
}

type Props = RectButtonProps & {
  data: TagProps;
  index: number;
};

export function TagListItem({ data, index, ...rest }: Props) {
  return (
    <Tag entering={FadeInUp.delay(index * 100)} {...rest}>
      <Name>{data.name}</Name>
    </Tag>
  );
}
