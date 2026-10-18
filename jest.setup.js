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

// react-native-reanimated is mocked minimally (the real library pulls
// react-native-worklets, whose native module is absent under jest-expo):
// animated views render as plain views, shared values are plain { value }
// holders, animation drivers (withSpring/withTiming) resolve synchronously
// to their target, and useAnimatedStyle recomputes on every render — wired
// positions are assertable, while the real animation runs native-only.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView, Image } = require('react-native');

  // Stateful like the real hook: the same { value } holder is returned on
  // every render, initialized once - updates flow through effects/handlers
  // setting .value, never through re-initialization.
  const useSharedValue = (initial) => {
    const ref = React.useRef(null);
    if (ref.current === null) {
      ref.current = { value: initial };
    }
    return ref.current;
  };

  const core = {
    __esModule: true,
    default: {
      View,
      Text,
      ScrollView,
      Image,
      createAnimatedComponent: (component) => component,
    },
    Animated: {
      View,
      Text,
      ScrollView,
      Image,
      createAnimatedComponent: (component) => component,
    },
    useSharedValue,
    useAnimatedStyle: (updater) => updater(),
    useAnimatedReaction: () => {},
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => () => {},
    useDerivedValue: (processor) => ({ value: processor() }),
    withSpring: (toValue) => toValue,
    withTiming: (toValue) => toValue,
    withDelay: (_delay, nextAnimation) => nextAnimation,
    withSequence: (...animations) => animations[0],
    withRepeat: (animation) => animation,
  };

  // Unknown exports (entering/exiting animation props, interpolators, ...)
  // resolve to inert objects so components referencing them still render.
  return new Proxy(core, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return {};
    },
  });
});
