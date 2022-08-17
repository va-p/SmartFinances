import React from 'react';
import {
  Container,
  Category,
  Icon,
  Name
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';
import { TouchableOpacityProps } from 'react-native';

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
  created_at: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
  tenant_id: string;
}

type Props = TouchableOpacityProps & {
  data: CategoryProps;
}

export function CategoryListItemRegisterTransaction({
  data,
  ...rest
}: Props) {
  return (
    <Container {...rest}>
      <Category  icon={data.icon.name}>
        <Icon name={data.icon.name} color={data.color.hex} />
      </Category>
      <Name>{data.name}</Name>
    </Container >
  );
}