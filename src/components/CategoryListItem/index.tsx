import React from 'react';
import { Container, Icon, Name } from './styles';

import { FadeInUp } from 'react-native-reanimated';
import { RectButtonProps } from 'react-native-gesture-handler';

import { CategoryProps } from '@interfaces/categories';

type Props = RectButtonProps & {
  data: CategoryProps;
  index: number;
};

export function CategoryListItem({ data, index, ...rest }: Props) {
  return (
    <Container
      entering={FadeInUp.delay(index * 100)}
      icon={data.icon.name}
      color={data.color.color_code || data.color.hex}
      {...rest}
    >
      <Icon
        name={data.icon.name}
        color={data.color.color_code || data.color.hex}
      />
      <Name>{data.name}</Name>
    </Container>
  );
}
