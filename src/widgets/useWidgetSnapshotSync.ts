import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@providers/AuthProvider';
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useCategoriesQuery } from '@hooks/useCategoriesQuery';
import { useFormattedBudgets } from '@hooks/useFormattedBudgets';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import type { WidgetBridgeApi } from 'widget-bridge';

import { buildWidgetSnapshot } from './buildWidgetSnapshot';

// Injectable bridge seam: the startup wiring registers the native module via
// `setWidgetBridge`; the hook never touches native code directly, which
// keeps it unit-testable and keeps business logic out of the bridge.

let bridge: WidgetBridgeApi | null = null;

export function setWidgetBridge(next: WidgetBridgeApi | null) {
  bridge = next;
}

// Rewrite delay so a burst of invalidations (foreground + refetch +
// mutation) produces a single snapshot write (WDG-35).
const SYNC_DEBOUNCE_MS = 1000;

export function useWidgetSnapshotSync(now?: Date) {
  const { budgets } = useFormattedBudgets();
  const { data: transactions } = useTransactionsQuery();
  const { data: accounts } = useAccountsQuery(true);
  const { data: categories } = useCategoriesQuery();
  const quotes = useQuotes();
  const { baseCurrency, hideAmount } = useUserConfigs();
  const { isSignedIn } = useAuth();
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setForegroundTick((tick) => tick + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  const payload = useMemo(() => {
    if (!transactions || !accounts || !categories) {
      return null;
    }
    // Without query data there is nothing to write, and the widgets keep
    // the last snapshot (WDG-09).
    return buildWidgetSnapshot({
      budgets,
      transactions,
      accounts,
      categories,
      quotes: {
        brlQuoteBtc: quotes.brlQuoteBtc,
        brlQuoteEur: quotes.brlQuoteEur,
        brlQuoteUsd: quotes.brlQuoteUsd,
        btcQuoteBrl: quotes.btcQuoteBrl,
        btcQuoteEur: quotes.btcQuoteEur,
        btcQuoteUsd: quotes.btcQuoteUsd,
        eurQuoteBrl: quotes.eurQuoteBrl,
        eurQuoteBtc: quotes.eurQuoteBtc,
        eurQuoteUsd: quotes.eurQuoteUsd,
        usdQuoteBrl: quotes.usdQuoteBrl,
        usdQuoteBtc: quotes.usdQuoteBtc,
        usdQuoteEur: quotes.usdQuoteEur,
      },
      baseCurrencyCode: baseCurrency.code,
      hidden: hideAmount,
      signedIn: isSignedIn,
      now,
    });
  }, [
    budgets,
    transactions,
    accounts,
    categories,
    quotes,
    baseCurrency,
    hideAmount,
    isSignedIn,
    foregroundTick,
    now,
  ]);

  useEffect(() => {
    if (!bridge) {
      return undefined;
    }
    if (!isSignedIn) {
      bridge.clearSnapshot();
      return undefined;
    }
    if (!payload) {
      return undefined;
    }
    const timer = setTimeout(() => {
      bridge?.setSnapshot(JSON.stringify(payload));
      bridge?.reloadTimelines();
    }, SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [payload, isSignedIn]);
}
