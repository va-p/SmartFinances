import React from 'react';
import { Container, Icon, Name } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { FadeInUp } from 'react-native-reanimated';

export interface IconProps {
  id: string;
  title?: string | undefined;
  name: string;
}

export interface ColorProps {
  id: string;
  name: string;
  hex: string;
}

export interface CategoryProps {
  id: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
  tenant_id: string;
}

type Props = RectButtonProps & {
  data: CategoryProps;
  index: number;
};

export function CategoryListItem({ data, index, ...rest }: Props) {
  return (
    <Container
      entering={FadeInUp.delay(index * 100)}
      icon={data.icon.name}
      color={data.color.hex}
      {...rest}
    >
      <Icon name={data.icon.name} color={data.color.hex} />
      <Name>{data.name}</Name>
    </Container>
  );
}
