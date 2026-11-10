// Deep-link contract shared by the iOS widget URLs, the Android
// PendingIntents, and the app router. Must stay in sync with
// `targets/widgets/WidgetTheme.swift` (WidgetLinks) and
// `targets/widgets-android/.../BaseWidgetProvider.kt` (URL_*).
export const WIDGET_LINK_SCHEME = 'com.vap.smartfinances';

export type WidgetLinkTarget =
  | { type: 'budgets' }
  | { type: 'budget'; id: string }
  | { type: 'addTransaction' }
  | { type: 'hideData' }
  | { type: 'overview' }
  | { type: 'accounts' }
  | { type: string };

export function buildWidgetDeepLink(target: WidgetLinkTarget): string {
  switch (target.type) {
    case 'budgets':
      return `${WIDGET_LINK_SCHEME}://budgets`;
    case 'budget':
      return `${WIDGET_LINK_SCHEME}://budgets/${(target as { id: string }).id}`;
    case 'addTransaction':
      return `${WIDGET_LINK_SCHEME}://?addTransaction=true`;
    case 'hideData':
      return `${WIDGET_LINK_SCHEME}://?hideData=true`;
    case 'overview':
      return `${WIDGET_LINK_SCHEME}://overview`;
    case 'accounts':
      return `${WIDGET_LINK_SCHEME}://accounts`;
    default:
      return `${WIDGET_LINK_SCHEME}://`;
  }
}
