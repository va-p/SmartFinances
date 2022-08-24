import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import {
  Container,
  Category,
  Icon,
  Name
} from './styles';

import { CategoryProps } from '@components/CategoryListItem';

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