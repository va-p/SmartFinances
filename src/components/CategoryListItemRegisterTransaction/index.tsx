import React from 'react';
import { Container, Category, Icon, Name } from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { CategoryProps } from '@components/CategoryListItem';

type Props = RectButtonProps & {
  data: CategoryProps;
  isChecked?: any;
};

export function CategoryListItemRegisterTransaction({
  data,
  isChecked,
  ...rest
}: Props) {
  return (
    <Container {...rest}>
      <Category isChecked={isChecked}>
        <Icon name={data.icon.name} color={data.color.hex} />
      </Category>
      <Name>{data.name}</Name>
    </Container>
  );
}
