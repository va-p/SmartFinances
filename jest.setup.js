// Runs after react-native-gesture-handler's own jestSetup.js (see setupFiles
// order in package.json). Two fixes so native-bound UI renders in tests:
//
// 1. GH's own mock implements RectButton with RN's TouchableNativeFeedback,
//    which requires a single child element - but this app's RectButton-based
//    components (SelectButton, ListItem) render multiple children, which the
//    real native-wrapped RawButton accepts. Re-mock GestureButtons with a
//    plain View passthrough.
// 2. @gorhor/bottom-sheet cannot present() under jest-expo (reanimated 4
//    pulls react-native-worklets, whose native module is absent). Mock the
//    sheet primitives with inert inline-rendering replacements so host refs
//    keep working present/dismiss methods.

jest.mock(
  'react-native-gesture-handler/src/components/GestureButtons',
  () => require('./jest/gestureButtonsMock')
);
jest.mock(
  'react-native-gesture-handler/lib/commonjs/components/GestureButtons',
  () => require('./jest/gestureButtonsMock')
);
jest.mock(
  'react-native-gesture-handler/lib/module/components/GestureButtons',
  () => require('./jest/gestureButtonsMock')
);

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');

  // Inert BottomSheetModal: renders its content inline (native sheets cannot
  // present under jest-expo) with working present/dismiss methods so host
  // refs behave like the real component. Rendering the children inline also
  // keeps env-broken suites failing fast instead of hanging on their
  // non-sheet code paths.
  class BottomSheetModal extends React.Component {
    present() {}

    dismiss() {}

    render() {
      return <View>{this.props.children}</View>;
    }
  }

  const BottomSheetView = ({ children }: any) => <View>{children}</View>;
  const BottomSheetModalProvider = ({ children }: any) => (
    <View>{children}</View>
  );

  return {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
  };
});
