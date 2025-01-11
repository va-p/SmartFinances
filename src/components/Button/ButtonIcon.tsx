import { ElementType } from 'react';

type ButtonIconProps = {
  icon: ElementType;
  size?: number;
  color?: string;
};

export function ButtonIcon({ icon: Icon, size, color }: ButtonIconProps) {
  return <Icon size={size} color={color} />;
}
