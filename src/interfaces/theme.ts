type Colors = {
  primary: string;
  primary_light: string;

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
};

type fonts = {
  regular: string;
  medium: string;
  bold: string;
};

export interface ThemeProps {
  colors: Colors;
  fonts: fonts;
}
