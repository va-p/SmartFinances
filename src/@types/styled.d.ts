import 'styled-components';

import { ThemeProps } from '@interfaces/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeProps {}
}
