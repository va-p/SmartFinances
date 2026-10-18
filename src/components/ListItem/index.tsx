import React from 'react';
import { IconsContainer, Item, Name } from './styles';
import { RectButtonProps } from 'react-native-gesture-handler';

import { useTheme } from 'styled-components';

import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';

import { ThemeProps } from '@interfaces/theme';

type ListItemProps = {
  id: number;
  name: string;
  isDefault?: boolean;
};

type Props = RectButtonProps & {
  data: ListItemProps;
  isActive: boolean;
};

export function ListItem({ data, isActive, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Item {...rest}>
      <Name isActive={isActive}>{data.name}</Name>

      <IconsContainer>
        {data.isDefault ? (
          <StarIcon size={20} weight='regular' color={theme.colors.primary} />
        ) : (
          ''
        )}

        {isActive ? (
          <CheckCircleIcon
            size={20}
            weight='regular'
            color={theme.colors.primary}
          />
        ) : (
          ''
        )}
      </IconsContainer>
    </Item>
  );
}
