import { create } from 'zustand';

import { CurrencyProps } from '@interfaces/currencies';

type CurrenciesStore = {
  currencies: CurrencyProps[];
  setCurrencies: (currencies: CurrencyProps[]) => void;
};

export const useCurrenciesStore = create<CurrenciesStore>((set) => ({
  currencies: [],
  setCurrencies: (currencies: CurrencyProps[]) => set({ currencies }),
}));
