import { parseDecimalInput } from '../parseDecimalInput';

describe('parseDecimalInput', () => {
  // Simple comma decimal (pt-BR typed)
  it('converts comma decimal to dot', () => {
    expect(parseDecimalInput('12,34')).toBe('12.34');
  });

  // Simple dot decimal (US / Android typed)
  it('preserves dot decimal', () => {
    expect(parseDecimalInput('12.34')).toBe('12.34');
  });

  // Integer
  it('preserves plain integers', () => {
    expect(parseDecimalInput('1234')).toBe('1234');
  });

  // Empty string
  it('returns empty string as-is', () => {
    expect(parseDecimalInput('')).toBe('');
  });

  // pt-BR formatted paste: "1.234,56"
  it('handles pt-BR formatted value with both separators', () => {
    expect(parseDecimalInput('1.234,56')).toBe('1234.56');
  });

  // US formatted paste: "1,234.56"
  it('handles US formatted value with both separators', () => {
    expect(parseDecimalInput('1,234.56')).toBe('1234.56');
  });

  // Partial input: user started with "0,"
  it('handles "0,5" (partial decimal)', () => {
    expect(parseDecimalInput('0,5')).toBe('0.5');
  });

  // Partial input: user typed comma but nothing after
  it('handles trailing comma (mid-typing)', () => {
    expect(parseDecimalInput('1,')).toBe('1.');
  });

  // Partial input: user started with comma
  it('handles leading comma (mid-typing)', () => {
    expect(parseDecimalInput(',5')).toBe('.5');
  });

  // Multiple dots only (already normalized)
  it('preserves multiple dots (unlikely but safe)', () => {
    expect(parseDecimalInput('1.2.3')).toBe('1.2.3');
  });

  // pt-BR large value with two thousands separators
  it('handles pt-BR with multiple thousands dots', () => {
    expect(parseDecimalInput('1.234.567,89')).toBe('1234567.89');
  });

  // US large value with two thousands separators
  it('handles US with multiple thousands commas', () => {
    expect(parseDecimalInput('1,234,567.89')).toBe('1234567.89');
  });

  // Single digit with comma
  it('handles single digit with comma', () => {
    expect(parseDecimalInput('0,0')).toBe('0.0');
  });

  // Value ending with dot (mid-typing)
  it('handles trailing dot (mid-typing)', () => {
    expect(parseDecimalInput('12.')).toBe('12.');
  });
});
