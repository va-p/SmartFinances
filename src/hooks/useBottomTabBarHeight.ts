import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Replacement for @react-navigation/bottom-tabs' useBottomTabBarHeight.
 * Returns the height of the bottom tab bar including safe area insets.
 */
export function useBottomTabBarHeight(): number {
  const { bottom } = useSafeAreaInsets();
  return 49 + bottom;
}
