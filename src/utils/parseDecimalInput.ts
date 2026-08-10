/**
 * Normalizes a numeric input string to use dot (.) as the decimal separator.
 *
 * Handles both pt-BR (comma as decimal, dot as thousands) and US/ISO
 * (dot as decimal, comma as thousands) formats. Uses the heuristic:
 * whichever separator appears last is the decimal separator.
 *
 * This keeps the value compatible with Yup number schemas and database
 * Decimal columns, regardless of the device's locale or keyboard type.
 *
 * @example
 * parseDecimalInput('12,34')     // '12.34'
 * parseDecimalInput('12.34')     // '12.34'
 * parseDecimalInput('1234')      // '1234'
 * parseDecimalInput('1.234,56')  // '1234.56'
 * parseDecimalInput('1,234.56')  // '1234.56'
 * parseDecimalInput('')          // ''
 * parseDecimalInput('0,5')       // '0.5'
 * parseDecimalInput('1,')        // '1.'   (mid-typing)
 * parseDecimalInput(',5')        // '.5'   (mid-typing)
 */
export function parseDecimalInput(text: string): string {
  if (!text) return text;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  // Both separators present — the last one is the decimal separator
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      // pt-BR style: dot = thousands, comma = decimal
      return text.replace(/\./g, '').replace(',', '.');
    }
    // US/ISO style: comma = thousands, dot = decimal
    return text.replace(/,/g, '');
  }

  // Only comma(s) present — treat as decimal separator
  if (lastComma >= 0) {
    return text.replace(',', '.');
  }

  // Only dot(s) or no separator — already normalized
  return text;
}

export default parseDecimalInput;
