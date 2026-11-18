import { act, renderHook } from '@testing-library/react-native';

import { useTransferDirection } from '@hooks/useTransferDirection';

describe('useTransferDirection (TRC-01/TRC-02/TRC-03)', () => {
  it('starts in destination mode (today behavior for create)', () => {
    const { result } = renderHook(() => useTransferDirection());

    expect(result.current.transferDirection).toBe('destination');
  });

  it('initializes source mode for CREDIT imports and destination for DEBIT', () => {
    const { result } = renderHook(() => useTransferDirection());

    act(() => {
      result.current.initConversionDirection('CREDIT');
    });
    expect(result.current.transferDirection).toBe('source');

    act(() => {
      result.current.initConversionDirection('DEBIT');
    });
    expect(result.current.transferDirection).toBe('destination');
  });

  it('toggles between source and destination on each call', () => {
    const { result } = renderHook(() => useTransferDirection());

    act(() => {
      result.current.initConversionDirection('CREDIT');
    });
    expect(result.current.transferDirection).toBe('source');

    act(() => {
      result.current.toggleTransferDirection();
    });
    expect(result.current.transferDirection).toBe('destination');

    act(() => {
      result.current.toggleTransferDirection();
    });
    expect(result.current.transferDirection).toBe('source');
  });
});
