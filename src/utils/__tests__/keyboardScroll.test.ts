import { computeKeyboardOverlap } from '@utils/keyboardScroll';

describe('computeKeyboardOverlap', () => {
  it('returns 0 when the keyboard is hidden', () => {
    expect(
      computeKeyboardOverlap({
        inputBottomY: 900,
        windowHeight: 800,
        keyboardHeight: 0,
      })
    ).toBe(0);
  });

  it('returns 0 when the input sits above the keyboard', () => {
    expect(
      computeKeyboardOverlap({
        inputBottomY: 400,
        windowHeight: 800,
        keyboardHeight: 300,
      })
    ).toBe(0);
  });

  it('keeps the default margin when the input touches the keyboard top', () => {
    expect(
      computeKeyboardOverlap({
        inputBottomY: 500,
        windowHeight: 800,
        keyboardHeight: 300,
      })
    ).toBe(12);
  });

  it('adds the covered distance to the margin', () => {
    expect(
      computeKeyboardOverlap({
        inputBottomY: 550,
        windowHeight: 800,
        keyboardHeight: 300,
      })
    ).toBe(62);
  });

  it('honours a custom margin', () => {
    expect(
      computeKeyboardOverlap({
        inputBottomY: 550,
        windowHeight: 800,
        keyboardHeight: 300,
        margin: 20,
      })
    ).toBe(70);
  });
});
