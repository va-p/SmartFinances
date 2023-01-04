import React from 'react';
import {
  Container,
  Category,
  Icon,
  Name
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

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
}

export function CategoryListItem({
  data,
  ...rest
}: Props) {
  return (
    <Container>
      <Category {...rest} icon={data.icon.name} color={data.color.hex}>
        <Icon name={data.icon.name} color={data.color.hex} />
        <Name>{data.name}</Name>
      </Category>
    </Container >
  );
}