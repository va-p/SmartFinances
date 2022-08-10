import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface QuotesBrlState {
  btcQuoteBrl: {
    price: number,
    last_updated: string;
  },
  eurQuoteBrl: {
    price: number,
    last_updated: string;
  },
  usdQuoteBrl: {
    price: number,
    last_updated: string;
  }
};

// Define the initial state using that type
const initialState: QuotesBrlState = {
  btcQuoteBrl: {
    price: 0,
    last_updated: ''
  },
  eurQuoteBrl: {
    price: 0,
    last_updated: ''
  },
  usdQuoteBrl: {
    price: 0,
    last_updated: ''
  }
};

export const quotesBrlSlice = createSlice({
  name: 'quotesBrl',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setBtcQuoteBrl: (state, action: PayloadAction<QuotesBrlState['btcQuoteBrl']>) => {
      state.btcQuoteBrl = action.payload;
    },
    setEurQuoteBrl: (state, action: PayloadAction<QuotesBrlState['eurQuoteBrl']>) => {
      state.eurQuoteBrl = action.payload;
    },
    setUsdQuoteBrl: (state, action: PayloadAction<QuotesBrlState['usdQuoteBrl']>) => {
      state.usdQuoteBrl = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setBtcQuoteBrl,
  setEurQuoteBrl,
  setUsdQuoteBrl
} = quotesBrlSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectBtcQuoteBrl = (state: RootState) => state.quotesBrl.btcQuoteBrl;
export const selectEurQuoteBrl = (state: RootState) => state.quotesBrl.eurQuoteBrl;
export const selectUsdQuoteBrl = (state: RootState) => state.quotesBrl.usdQuoteBrl;

export default quotesBrlSlice.reducer;