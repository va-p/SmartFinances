export interface IconProps {
  id: string;
  title?: string | undefined;
  name: string;
}

export interface ColorProps {
  id: string;
  name: string;
  hex: string;
  color_code: string;
}

export interface CategoryProps {
  id: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
}
