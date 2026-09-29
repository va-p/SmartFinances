import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { Placeholder, Container, Icon } from './styles';

import { CategoryProps } from '@interfaces/categories';

type Props = TouchableOpacityProps & {
  categorySelected: CategoryProps;
  icon: string;
  color: string;
};

export function CategorySelectButton({
  categorySelected,
  icon,
  color,
  ...rest
}: Props) {
  if (categorySelected.id === '') {
    return <Placeholder activeOpacity={0.7} {...rest} />;
  }
  return (
    <Container {...rest}>
      <Icon name={icon} color={color} />
    </Container>
  );
}
