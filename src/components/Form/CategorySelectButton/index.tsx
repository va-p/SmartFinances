import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import {
  Placeholder,
  Container,
  Description,
  Title,
  Icon,
  IconChevronDown
} from './styles';

import { CategoryProps } from '@components/CategoryListItem';

type Props = TouchableOpacityProps & {
  categorySelected: CategoryProps;
  icon: string;
  color: string;
}

export function CategorySelectButton({
  categorySelected,
  icon,
  color,
  ...rest
}: Props) {
  if (categorySelected.id === '') {
    return <Placeholder {...rest}/>
  };
  return (
    <Container {...rest}>
      <Icon name={icon} color={color} />
    </Container>
  );
}