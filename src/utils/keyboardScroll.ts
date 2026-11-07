type KeyboardOverlapParams = {
  /** Input's bottom edge in window coordinates. */
  inputBottomY: number;
  windowHeight: number;
  /** Keyboard height; 0 or less means hidden. */
  keyboardHeight: number;
  /** Breathing room kept between input and keyboard. */
  margin?: number;
};

/**
 * How far a scroll view must shift so a focused input clears the keyboard.
 * Returns 0 when the keyboard is hidden or the input is already visible.
 */
export function computeKeyboardOverlap({
  inputBottomY,
  windowHeight,
  keyboardHeight,
  margin = 12,
}: KeyboardOverlapParams): number {
  if (keyboardHeight <= 0) {
    return 0;
  }

  const keyboardTop = windowHeight - keyboardHeight;
  return Math.max(0, inputBottomY - keyboardTop + margin);
}
