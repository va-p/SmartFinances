import { create } from 'zustand';

import { Quote } from '@interfaces/CurrencyConversionRates';

type Quotes = {
  brlQuoteBtc: Quote;
  setBrlQuoteBtc: (brlQuoteBtc: Quote) => void;
  brlQuoteEur: Quote;
  setBrlQuoteEur: (brlQuoteBtc: Quote) => void;
  brlQuoteUsd: Quote;
  setBrlQuoteUsd: (brlQuoteBtc: Quote) => void;
  btcQuoteBrl: Quote;
  setBtcQuoteBrl: (btcQuoteBrl: Quote) => void;
  btcQuoteEur: Quote;
  setBtcQuoteEur: (btcQuoteEur: Quote) => void;
  btcQuoteUsd: Quote;
  setBtcQuoteUsd: (btcQuoteUsd: Quote) => void;
  eurQuoteBrl: Quote;
  setEurQuoteBrl: (eurQuoteBrl: Quote) => void;
  eurQuoteBtc: Quote;
  setEurQuoteBtc: (eurQuoteBtc: Quote) => void;
  eurQuoteUsd: Quote;
  setEurQuoteUsd: (eurQuoteUsd: Quote) => void;
  usdQuoteBrl: Quote;
  setUsdQuoteBrl: (usdQuoteBrl: Quote) => void;
  usdQuoteBtc: Quote;
  setUsdQuoteBtc: (usdQuoteBrl: Quote) => void;
  usdQuoteEur: Quote;
  setUsdQuoteEur: (usdQuoteEur: Quote) => void;
};

export const useQuotes = create<Quotes>((set) => ({
  brlQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  setBrlQuoteBtc: (brlQuoteBtc: Quote) =>
    set(() => ({ brlQuoteBtc })),
  brlQuoteEur: {
    price: 0,
    last_updated: '',
  },
  setBrlQuoteEur: (brlQuoteEur: Quote) =>
    set(() => ({ brlQuoteEur })),
  brlQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  setBrlQuoteUsd: (brlQuoteUsd: Quote) =>
    set(() => ({ brlQuoteUsd })),
  btcQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  setBtcQuoteBrl: (btcQuoteBrl: Quote) =>
    set(() => ({ btcQuoteBrl })),
  btcQuoteEur: {
    price: 0,
    last_updated: '',
  },
  setBtcQuoteEur: (btcQuoteEur: Quote) =>
    set(() => ({ btcQuoteEur })),
  btcQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  setBtcQuoteUsd: (btcQuoteUsd: Quote) =>
    set(() => ({ btcQuoteUsd })),
  eurQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  setEurQuoteBrl: (eurQuoteBrl: Quote) =>
    set(() => ({ eurQuoteBrl })),
  eurQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  setEurQuoteBtc: (eurQuoteBtc: Quote) =>
    set(() => ({ eurQuoteBtc })),
  eurQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  setEurQuoteUsd: (eurQuoteUsd: Quote) =>
    set(() => ({ eurQuoteUsd })),
  usdQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  setUsdQuoteBrl: (usdQuoteBrl: Quote) =>
    set(() => ({ usdQuoteBrl })),
  usdQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  setUsdQuoteBtc: (usdQuoteBtc: Quote) =>
    set(() => ({ usdQuoteBtc })),
  usdQuoteEur: {
    price: 0,
    last_updated: '',
  },
  setUsdQuoteEur: (usdQuoteEur: Quote) =>
    set(() => ({ usdQuoteEur })),
}));
