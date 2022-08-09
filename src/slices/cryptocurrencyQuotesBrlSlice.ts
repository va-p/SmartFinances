import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface cryptocurrencyQuotesBrlState {
  btcQuote: {
    quote: {
      BRL: {
        price: number;
      }
    }
  }
};

// Define the initial state using that type
const initialState: cryptocurrencyQuotesBrlState = {
  btcQuote: {
    quote: {
      BRL: {
        price: 0
      }
    }
  }
};

export const cryptocurrencyQuotesBrlSlice = createSlice({
  name: 'cryptocurrencyQuotesBrl',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setBtcQuote: (state, action: PayloadAction<cryptocurrencyQuotesBrlState['btcQuote']>) => {
      state.btcQuote = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setBtcQuote
} = cryptocurrencyQuotesBrlSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectBtcQuote = (state: RootState) => state.cryptocurrencyQuotesBrl.btcQuote;

export default cryptocurrencyQuotesBrlSlice.reducer;