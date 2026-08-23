import React from 'react';

import { useTheme } from 'styled-components';

import {
  AvatarWrapper,
  AvatarCircle,
  CategoryIcon,
  FallbackLetter,
  StatusBadge,
} from './styles';

import CheckCircle from 'phosphor-react-native/src/icons/CheckCircle';
import Clock from 'phosphor-react-native/src/icons/Clock';

import { ThemeProps } from '@interfaces/theme';
import { CategoryProps } from '@interfaces/categories';

type Props = {
  name: string;
  category: CategoryProps;
  size?: number;
  /** When set, renders a status badge (check/clock) over the avatar. */
  isPaid?: boolean;
};

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/**
 * Circular subscription avatar: category icon in its color over a soft tint
 * of the same color; falls back to the first letter of the name. Optionally
 * shows a paid/pending status badge (Tela 5 rows).
 */
export function SubscriptionAvatar({
  name,
  category,
  size = 40,
  isPaid,
}: Props) {
  const theme = useTheme() as ThemeProps;

  const color = category?.color?.color_code;
  const hasIcon = Boolean(category?.icon?.name);
  const backgroundColor =
    color && HEX_COLOR.test(color) ? `${color}22` : theme.colors.shape;

  return (
    <AvatarWrapper>
      <AvatarCircle size={size} backgroundColor={backgroundColor}>
        {hasIcon ? (
          <CategoryIcon
            name={category.icon.name as any}
            size={size * 0.5}
            color={color ?? theme.colors.primary}
          />
        ) : (
          <FallbackLetter size={size}>
            {(name.charAt(0) || '?').toUpperCase()}
          </FallbackLetter>
        )}
      </AvatarCircle>

      {isPaid !== undefined && (
        <StatusBadge>
          {isPaid ? (
            <CheckCircle size={14} weight='fill' color={theme.colors.success} />
          ) : (
            <Clock size={14} weight='fill' color={theme.colors.primary} />
          )}
        </StatusBadge>
      )}
    </AvatarWrapper>
  );
}
