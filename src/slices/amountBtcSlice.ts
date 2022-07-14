import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface AmountBtcState {
  revenues: {
    amount: string;
  };
  expenses: {
    amount: string;
  };
  total: {
    amount: string;
  };
}

// Define the initial state using that type
const initialState: AmountBtcState = {
  revenues: {
    amount: 'BTC 0',
  },
  expenses: {
    amount: 'BTC 0',
  },
  total: {
    amount: 'BTC 0',
  }
};

export const amountBtcSlice = createSlice({
  name: 'amountBtc',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setRevenuesBtc: (state, action: PayloadAction<AmountBtcState['revenues']>) => {
      state.revenues = action.payload;
    },
    setExpensesBtc: (state, action: PayloadAction<AmountBtcState['expenses']>) => {
      state.expenses = action.payload;
    },
    setTotalBtc: (state, action: PayloadAction<AmountBtcState['total']>) => {
      state.total = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setRevenuesBtc,
  setExpensesBtc,
  setTotalBtc
} = amountBtcSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectRevenuesBtc = (state: RootState) => state.amountBtc.revenues;
export const selectExpensesBtc = (state: RootState) => state.amountBtc.expenses;
export const selectTotalBtc = (state: RootState) => state.amountBtc.total;

export default amountBtcSlice.reducer;