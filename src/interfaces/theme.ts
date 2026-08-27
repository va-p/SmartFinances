type Colors = {
  primary: string;
  primary_light: string;
  primary_dark: string;

  background: string;
  backgroundNav: string;
  statusBar: string;
  backgroundCardHeader: string;

  gradientStart: string;
  gradientEnd: string;

  shape: string;
  shapeDark: string;

  button: string;

  title: string;
  text: string;
  textPlaceholder: string;
  textLight: string;

  border: string;

  success: string;
  success_light: string;

  attention: string;
  attention_light: string;

  overlay: string;
  overlay10: string;
  overlayGray: string;

  chartRule: string;
  xAxisColor: string;
  xAxisLabel: string;
};

type Borders = {
  default: string;
  borderRadiusScreenSectionContent: string;
  borderRadiusShape: string;
  borderRadiusButtonAndInput: string;
}

type Fonts = {
  regular: string;
  medium: string;
  bold: string;
  sizeTitleXl: string;
  sizeTitle: string;
  sizeSubtitle: string;
  sizeText: string;
};

export interface ThemeProps {
  colors: Colors;
  borders: Borders;
  fonts: Fonts;
}
