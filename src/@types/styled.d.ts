import 'styled-components';

import ThemeProps from '@interfaces/theme';

declare module 'styled-components' {
  type ThemeType = typeof ThemeProps;

  export interface DefaultTheme extends ThemeType {}
}
