import { act, renderHook } from '@testing-library/react-native';

import { useAuth } from '@providers/AuthProvider';
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useCategoriesQuery } from '@hooks/useCategoriesQuery';
import { useFormattedBudgets } from '@hooks/useFormattedBudgets';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

import {
  setWidgetBridge,
  useWidgetSnapshotSync,
} from '../useWidgetSnapshotSync';

jest.mock('@providers/AuthProvider', () => ({ useAuth: jest.fn() }));
jest.mock('@stores/quotesStorage', () => ({ useQuotes: jest.fn() }));
jest.mock('@stores/userConfigsStorage', () => ({ useUserConfigs: jest.fn() }));
jest.mock('@hooks/useAccountsQuery', () => ({ useAccountsQuery: jest.fn() }));
jest.mock('@hooks/useCategoriesQuery', () => ({
  useCategoriesQuery: jest.fn(),
}));
jest.mock('@hooks/useFormattedBudgets', () => ({
  useFormattedBudgets: jest.fn(),
}));
jest.mock('@hooks/useTransactionsQuery', () => ({
  useTransactionsQuery: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseQuotes = useQuotes as unknown as jest.Mock;
const mockedUseUserConfigs = useUserConfigs as unknown as jest.Mock;
const mockedUseAccountsQuery = useAccountsQuery as jest.Mock;
const mockedUseCategoriesQuery = useCategoriesQuery as jest.Mock;
const mockedUseFormattedBudgets = useFormattedBudgets as jest.Mock;
const mockedUseTransactionsQuery = useTransactionsQuery as jest.Mock;

const brl = { id: 1, name: 'Brazilian Real', code: 'BRL', symbol: 'R$' };

function seed() {
  mockedUseFormattedBudgets.mockReturnValue({ budgets: [], isLoading: false });
  mockedUseTransactionsQuery.mockReturnValue({ data: [], isLoading: false });
  mockedUseAccountsQuery.mockReturnValue({
    data: [
      {
        id: 1,
        name: 'Conta',
        currency: brl,
        type: 'BANK',
        balance: 1000,
        initialAmount: 0,
      },
    ],
    isLoading: false,
  });
  mockedUseCategoriesQuery.mockReturnValue({ data: [], isLoading: false });
  mockedUseQuotes.mockReturnValue({});
  mockedUseUserConfigs.mockReturnValue({
    baseCurrency: brl,
    hideAmount: false,
  });
  mockedUseAuth.mockReturnValue({ isSignedIn: true });
}

describe('useWidgetSnapshotSync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    setWidgetBridge(null);
    seed();
  });

  afterEach(() => {
    jest.useRealTimers();
    setWidgetBridge(null);
  });

  // WDG-35 — snapshot rewritten after data changes (debounced)
  it('writes the snapshot and reloads timelines after the debounce', () => {
    const bridge = {
      setSnapshot: jest.fn(),
      clearSnapshot: jest.fn(),
      reloadTimelines: jest.fn(),
    };
    setWidgetBridge(bridge);

    renderHook(() => useWidgetSnapshotSync());

    expect(bridge.setSnapshot).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(bridge.setSnapshot).toHaveBeenCalledTimes(1);
    expect(bridge.reloadTimelines).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(bridge.setSnapshot.mock.calls[0][0] as string);
    expect(payload.version).toBe(1);
    expect(payload.signedIn).toBe(true);
    expect(payload.netWorth.total).toBe('R$\u00A01.000,00');
  });

  // WDG-37 — sign-out clears the snapshot instead of writing values
  it('clears the snapshot when signed out', () => {
    const bridge = {
      setSnapshot: jest.fn(),
      clearSnapshot: jest.fn(),
      reloadTimelines: jest.fn(),
    };
    setWidgetBridge(bridge);
    mockedUseAuth.mockReturnValue({ isSignedIn: false });

    renderHook(() => useWidgetSnapshotSync());
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(bridge.clearSnapshot).toHaveBeenCalledTimes(1);
    expect(bridge.setSnapshot).not.toHaveBeenCalled();
  });

  // WDG-09 — loading data keeps the last snapshot (no blank write)
  it('does not write while queries are still loading', () => {
    const bridge = {
      setSnapshot: jest.fn(),
      clearSnapshot: jest.fn(),
      reloadTimelines: jest.fn(),
    };
    setWidgetBridge(bridge);
    mockedUseTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderHook(() => useWidgetSnapshotSync());
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(bridge.setSnapshot).not.toHaveBeenCalled();
    expect(bridge.reloadTimelines).not.toHaveBeenCalled();
    expect(bridge.clearSnapshot).not.toHaveBeenCalled();
  });

  // WDG-21 — hide-amounts thread through to masked values
  it('masks values when hide-amounts is on', () => {
    const bridge = {
      setSnapshot: jest.fn(),
      clearSnapshot: jest.fn(),
      reloadTimelines: jest.fn(),
    };
    setWidgetBridge(bridge);
    mockedUseUserConfigs.mockReturnValue({
      baseCurrency: brl,
      hideAmount: true,
    });

    renderHook(() => useWidgetSnapshotSync());
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const payload = JSON.parse(bridge.setSnapshot.mock.calls[0][0] as string);
    expect(payload.hidden).toBe(true);
    expect(payload.netWorth.total).toBe('R$\u00A0••••');
  });

  // Edge — a failing container write never breaks the sync chain; the next
  // refresh retries.
  it('survives a throwing bridge and retries on the next change', () => {
    const setSnapshot = jest.fn();
    setSnapshot.mockImplementationOnce(() => {
      throw new Error('no container');
    });
    const bridge = {
      setSnapshot,
      clearSnapshot: jest.fn(),
      reloadTimelines: jest.fn(),
    };
    setWidgetBridge(bridge);

    renderHook(() => useWidgetSnapshotSync());
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }).not.toThrow();
    expect(bridge.reloadTimelines).not.toHaveBeenCalled();

    mockedUseTransactionsQuery.mockReturnValue({
      data: [
        {
          id: 9,
          created_at: '2026-11-10T12:00:00.000Z',
          description: 'retry',
          amount: 10,
          currency: { code: 'BRL' },
          type: 'CREDIT',
          account: { currency: { code: 'BRL' } },
          category: { id: 'c1' },
          tags: [],
          user_id: 'u1',
        },
      ],
      isLoading: false,
    });
    renderHook(() => useWidgetSnapshotSync());
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(bridge.reloadTimelines).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no bridge is registered', () => {
    renderHook(() => useWidgetSnapshotSync());
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  });
});
