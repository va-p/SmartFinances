// RectButton mock for jest.setup.js: GH's own mock implements RectButton
// with RN's TouchableNativeFeedback, which requires a single child element -
// but this app's RectButton-based components (SelectButton, ListItem) render
// multiple children, which the real native-wrapped RawButton accepts. A
// plain View passthrough keeps that behavior in tests.
const React = require('react');
const { View } = require('react-native');

const RawButton = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

module.exports = {
  RawButton,
  BaseButton: RawButton,
  RectButton: RawButton,
  BorderlessButton: RawButton,
};
