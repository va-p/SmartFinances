import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define a type for the slice state
interface QuotesState {
  brlQuoteBtc: {
    price: number;
    last_updated: string;
  };
  brlQuoteEur: {
    price: number;
    last_updated: string;
  };
  brlQuoteUsd: {
    price: number;
    last_updated: string;
  };
  btcQuoteBrl: {
    price: number;
    last_updated: string;
  };
  btcQuoteEur: {
    price: number;
    last_updated: string;
  };
  btcQuoteUsd: {
    price: number;
    last_updated: string;
  };
  eurQuoteBrl: {
    price: number;
    last_updated: string;
  };
  eurQuoteBtc: {
    price: number;
    last_updated: string;
  };
  eurQuoteUsd: {
    price: number;
    last_updated: string;
  };
  usdQuoteBrl: {
    price: number;
    last_updated: string;
  };
  usdQuoteBtc: {
    price: number;
    last_updated: string;
  };
  usdQuoteEur: {
    price: number;
    last_updated: string;
  };
}

// Define the initial state using that type
const initialState: QuotesState = {
  brlQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  brlQuoteEur: {
    price: 0,
    last_updated: '',
  },
  brlQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  btcQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  btcQuoteEur: {
    price: 0,
    last_updated: '',
  },
  btcQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  eurQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  eurQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  eurQuoteUsd: {
    price: 0,
    last_updated: '',
  },
  usdQuoteBrl: {
    price: 0,
    last_updated: '',
  },
  usdQuoteBtc: {
    price: 0,
    last_updated: '',
  },
  usdQuoteEur: {
    price: 0,
    last_updated: '',
  },
};

export const quotesSlice = createSlice({
  name: 'quotesBrl',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setBrlQuoteBtc: (
      state,
      action: PayloadAction<QuotesState['brlQuoteBtc']>
    ) => {
      state.brlQuoteBtc = action.payload;
    },
    setBrlQuoteEur: (
      state,
      action: PayloadAction<QuotesState['brlQuoteEur']>
    ) => {
      state.brlQuoteEur = action.payload;
    },
    setBrlQuoteUsd: (
      state,
      action: PayloadAction<QuotesState['brlQuoteUsd']>
    ) => {
      state.brlQuoteUsd = action.payload;
    },
    setBtcQuoteBrl: (
      state,
      action: PayloadAction<QuotesState['btcQuoteBrl']>
    ) => {
      state.btcQuoteBrl = action.payload;
    },
    setBtcQuoteEur: (
      state,
      action: PayloadAction<QuotesState['btcQuoteEur']>
    ) => {
      state.btcQuoteEur = action.payload;
    },
    setBtcQuoteUsd: (
      state,
      action: PayloadAction<QuotesState['btcQuoteUsd']>
    ) => {
      state.btcQuoteUsd = action.payload;
    },
    setEurQuoteBrl: (
      state,
      action: PayloadAction<QuotesState['eurQuoteBrl']>
    ) => {
      state.eurQuoteBrl = action.payload;
    },
    setEurQuoteBtc: (
      state,
      action: PayloadAction<QuotesState['eurQuoteBtc']>
    ) => {
      state.eurQuoteBtc = action.payload;
    },
    setEurQuoteUsd: (
      state,
      action: PayloadAction<QuotesState['eurQuoteUsd']>
    ) => {
      state.eurQuoteUsd = action.payload;
    },
    setUsdQuoteBrl: (
      state,
      action: PayloadAction<QuotesState['usdQuoteBrl']>
    ) => {
      state.usdQuoteBrl = action.payload;
    },
    setUsdQuoteBtc: (
      state,
      action: PayloadAction<QuotesState['usdQuoteBtc']>
    ) => {
      state.usdQuoteBtc = action.payload;
    },
    setUsdQuoteEur: (
      state,
      action: PayloadAction<QuotesState['usdQuoteEur']>
    ) => {
      state.usdQuoteEur = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setBrlQuoteBtc,
  setBrlQuoteEur,
  setBrlQuoteUsd,
  setBtcQuoteBrl,
  setBtcQuoteEur,
  setBtcQuoteUsd,
  setEurQuoteBrl,
  setEurQuoteBtc,
  setEurQuoteUsd,
  setUsdQuoteBrl,
  setUsdQuoteBtc,
  setUsdQuoteEur,
} = quotesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectBrlQuoteBtc = (state: RootState) => state.quotes.brlQuoteBtc;
export const selectBrlQuoteEur = (state: RootState) => state.quotes.brlQuoteEur;
export const selectBrlQuoteUsd = (state: RootState) => state.quotes.brlQuoteUsd;
export const selectBtcQuoteBrl = (state: RootState) => state.quotes.btcQuoteBrl;
export const selectBtcQuoteEur = (state: RootState) => state.quotes.btcQuoteEur;
export const selectBtcQuoteUsd = (state: RootState) => state.quotes.btcQuoteUsd;
export const selectEurQuoteBrl = (state: RootState) => state.quotes.eurQuoteBrl;
export const selectEurQuoteBtc = (state: RootState) => state.quotes.eurQuoteBtc;
export const selectEurQuoteUsd = (state: RootState) => state.quotes.eurQuoteUsd;
export const selectUsdQuoteBrl = (state: RootState) => state.quotes.usdQuoteBrl;
export const selectUsdQuoteBtc = (state: RootState) => state.quotes.usdQuoteBtc;
export const selectUsdQuoteEur = (state: RootState) => state.quotes.usdQuoteEur;
export default quotesSlice.reducer;
